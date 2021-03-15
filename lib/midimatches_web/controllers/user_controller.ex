defmodule MidimatchesWeb.UserController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.Utils

  require Logger

  @min_user_alias_length 3
  @max_user_alias_length 10

  @spec self(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get current session user
  """
  def self(conn, _params) do
    curr_user =
      conn
      |> get_session(:user)

    conn
    |> json(%{
      user: curr_user
    })
  end

  @spec reset(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Reset user session
  """
  def reset(conn, _params) do
    conn
    |> delete_session(:user)
    |> json(%{})
  end

  @spec upsert(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Upsert user
  """
  def upsert(conn, %{"user_alias" => user_alias}) do
    with {:ok, user_alias} <- parse_user_alias(user_alias) do
      if is_nil(get_session(conn, :user)) do
        # TODO persist new user
        new_user = %{user_alias: user_alias, user_id: Utils.gen_uuid()}

        put_session(conn, :user, new_user)
        |> json(%{})
      else
        existing_user = get_session(conn, :user)

        put_session(conn, :user, %{existing_user | user_alias: user_alias})
        |> json(%{})
      end
    else
      # TODO persist updated user
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

  @spec parse_user_alias(String.t()) :: {:error, String.t()} | {:ok, String.t()}
  def parse_user_alias(user_alias) do
    user_alias_len = String.length(user_alias)

    if user_alias_len < @min_user_alias_length or user_alias_len > @max_user_alias_length do
      {:error, invalid_value_error("user_alias")}
    else
      {:ok, user_alias}
    end
  end
end
