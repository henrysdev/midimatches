defmodule ProgressionsWeb.UserController do
  use ProgressionsWeb, :controller

  alias Progressions.Utils

  @spec register(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Registers a new user and returns created user object
  """
  def register(conn, %{"user_alias" => user_alias}) do
    user_id = Utils.gen_uuid()

    curr_user = %{user_alias: user_alias, user_id: user_id}

    conn
    |> assign(:curr_user, curr_user)
    |> json(%{user: curr_user})
  end
end
