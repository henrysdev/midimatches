defmodule MidimatchesWeb.UserController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.{
    Types.User,
    UserCache,
    Utils
  }

  require Logger

  @type id() :: String.t()

  @spec self(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get current session user
  """
  def self(conn, _params) do
    if has_user_session?(conn) do
      {curr_user, conn} =
        conn
        |> get_session(:user)
        |> handle_user_session(conn)

      conn
      |> json(%{
        user: curr_user
      })
    else
      json(conn, %{
        user: nil
      })
    end
  end

  defp handle_user_session(session_user, conn) when is_struct(session_user) do
    session_user
    |> Map.from_struct()
    |> handle_user_session(conn)
  end

  defp handle_user_session(session_user, conn) when is_map(session_user) do
    %{user_id: user_id} = struct(User, session_user)

    if UserCache.user_id_exists?(user_id) do
      case UserCache.get_user_by_id(user_id) do
        {:ok, user} ->
          {Utils.server_to_client_user(user), conn}

        {:error, _reason} ->
          {nil, conn}
      end
    else
      case UserCache.delete_user_by_id(user_id) do
        {:ok, _} ->
          {nil, delete_session(conn, :user)}

        {:error, _reason} ->
          {nil, conn}
      end
    end
  end

  @spec reset(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Reset user session
  """
  def reset(conn, _params) do
    user_id =
      conn
      |> get_session(:user)
      |> (& &1.user_id).()

    case UserCache.delete_user_by_id(user_id) do
      {:ok, _any} ->
        conn
        |> delete_session(:user)
        |> json(%{})

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  @spec upsert(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Upsert user
  """
  def upsert(conn, %{"user_alias" => user_alias}) do
    user_id =
      if has_user_session?(conn) do
        get_session(conn, :user).user_id
      else
        "nosession"
      end

    if has_user_session?(conn) do
      # updates an existing user
      with {:ok, existing_user} <-
             get_session(conn, :user)
             |> (& &1.user_id).()
             |> UserCache.get_user_by_id(),
           {:ok, updated_user} <-
             %User{existing_user | user_alias: user_alias}
             |> UserCache.upsert_user() do
        Logger.info("existing user updated alias user_id=#{user_id} user_alias=#{user_alias}")

        conn
        |> put_session(:user, updated_user)
        |> json(%{})
      else
        {:error, reason} ->
          conn
          |> bad_json_request(reason)
      end
    else
      # creates a new user
      case UserCache.upsert_user(%User{user_alias: user_alias}) do
        {:ok, new_user} ->
          conn
          |> put_session(:user, new_user)
          |> json(%{})

        {:error, reason} ->
          conn
          |> bad_json_request(reason)
      end
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
end
