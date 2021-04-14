defmodule MidimatchesWeb.UserController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.{
    ProfanityFilter,
    Types.User,
    UserCache,
    Utils
  }

  require Logger

  @min_user_alias_length 3
  @max_user_alias_length 10

  @type id() :: String.t()

  @spec self(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get current session user
  """
  def self(conn, _params) do
    session_user = get_session(conn, :user)

    if is_nil(session_user) do
      json(conn, %{
        user: nil
      })
    else
      curr_user =
        session_user
        |> handle_user_session(conn)
        |> Utils.server_to_client_user()

      conn
      |> json(%{
        user: curr_user
      })
    end
  end

  defp handle_user_session(session_user, conn) when is_struct(session_user) do
    session_user
    |> Map.from_struct()
    |> handle_user_session(conn)
  end

  defp handle_user_session(session_user, conn) when is_map(session_user) do
    struct(User, session_user)
    |> update_remote_ip(conn)
    |> UserCache.get_or_insert_user()
  end

  @spec reset(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Reset user session
  """
  def reset(conn, _params) do
    conn
    |> get_session(:user)
    |> (& &1.user_id).()
    |> UserCache.delete_user_by_id()

    conn
    |> delete_session(:user)
    |> json(%{})
  end

  @spec upsert(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Upsert user
  """
  def upsert(conn, %{"user_alias" => user_alias}) do
    session_user = get_session(conn, :user)

    user_id =
      if is_nil(session_user) do
        "nosession"
      else
        session_user.user_id
      end

    with {:ok, user_alias} <- parse_user_alias(user_alias, user_id) do
      if has_user_session?(conn) do
        # update an existing user
        existing_user =
          get_session(conn, :user)
          |> (& &1.user_id).()
          |> UserCache.get_user_by_id()

        updated_user =
          %User{existing_user | user_alias: user_alias}
          |> update_remote_ip(conn)
          |> UserCache.upsert_user()

        conn
        |> put_session(:user, updated_user)
        |> json(%{})
      else
        # create and insert new user
        user_id = Utils.gen_uuid()

        new_user =
          %User{user_alias: user_alias, user_id: user_id}
          |> update_remote_ip(conn)
          |> UserCache.upsert_user()

        conn
        |> put_session(:user, new_user)
        |> json(%{})
      end
    else
      {:error, reason} ->
        Logger.warn("update user failed with error reason #{reason}")

        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec sync(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Sync server with client via NTP round-trip
  """
  def sync(conn, %{"client_start_time" => client_start_time}) do
    client_start_time = String.to_integer(client_start_time)
    server_time = Utils.curr_utc_timestamp()
    first_hop_delta_time = server_time - client_start_time

    conn
    |> json(%{
      first_hop_delta_time: first_hop_delta_time,
      server_time: server_time
    })
  end

  @spec parse_user_alias(String.t(), id()) :: {:error, String.t()} | {:ok, String.t()}
  def parse_user_alias(user_alias, user_id) do
    with {:ok, user_alias} <- validate_user_alias_length(user_alias),
         {:ok, user_alias} <- validate_user_alias_profanity(user_alias, user_id) do
      {:ok, user_alias}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp validate_user_alias_length(user_alias) do
    user_alias_len = String.length(user_alias)

    if user_alias_len < @min_user_alias_length or user_alias_len > @max_user_alias_length do
      {:error, invalid_value_error("user_alias", :invalid_length)}
    else
      {:ok, user_alias}
    end
  end

  defp validate_user_alias_profanity(user_alias, user_id) do
    if ProfanityFilter.contains_profanity?(user_alias) do
      Logger.warn(
        "[PROFANITY_ALERT]: user_id=#{user_id} tried to change user to user_alias=#{user_alias}"
      )

      {:error, invalid_value_error("user_alias", :profanity)}
    else
      {:ok, user_alias}
    end
  end

  defp update_remote_ip(%User{} = user, conn) do
    remote_ip = to_string(:inet_parse.ntoa(conn.remote_ip))
    %User{user | remote_ip: remote_ip}
  end
end
