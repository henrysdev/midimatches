defmodule ProgressionsWeb.UserController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use ProgressionsWeb, :controller

  alias Progressions.Utils

  @spec edit(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Edit user object to their session
  """
  def edit(conn, %{"user_alias" => user_alias}) do
    if is_nil(get_session(conn, :user)) do
      new_user = %{user_alias: user_alias, user_id: Utils.gen_uuid()}
      put_session(conn, :user, new_user)
    else
      existing_user = get_session(conn, :user)
      put_session(conn, :user, %{existing_user | user_alias: user_alias})
    end
    |> json(%{})
  end

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
end
