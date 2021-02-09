defmodule ProgressionsWeb.UserController do
  use ProgressionsWeb, :controller

  alias Progressions.Utils

  @spec register(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Register user object to their session if one does not yet exist
  """
  def register(conn, %{"user_alias" => user_alias}) do
    if is_nil(get_session(conn, :user)) do
      curr_user = %{user_alias: user_alias, user_id: Utils.gen_uuid()}
      put_session(conn, :user, curr_user)
    else
      conn
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

    # ** DEBUG ** clear session for debug purposes. Remove for prod use
    conn
    |> json(%{
      user: curr_user
    })
  end
end
