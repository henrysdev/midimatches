defmodule MidimatchesWeb.AccountController do
  @moduledoc """
  Provides API for user accounts stored in the users database table.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb, as: Db

  require Logger

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Create a new user account
  """
  def create(
        conn,
        %{
          "username" => _username,
          "email" => _email,
          "password" => _password
        } = user_params
      ) do
    case Db.Users.create_user(user_params) do
      {:ok, created_user} ->
        conn
        |> json(%{user: created_user})

      {:error, changeset_error} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: changeset_error})
    end
  end

  @spec login(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Attempt to login to a user account and start an authenticated session
  """
  def login(conn, %{"username" => username, "password" => password}) do
    attempt_login(conn, %{username: username, password: password})
  end

  def login(conn, %{"email" => email, "password" => password}) do
    attempt_login(conn, %{email: email, password: password})
  end

  defp attempt_login(conn, user_params) do
    case Db.Users.get_user_by_creds(user_params) do
      {:ok, _found_user} ->
        # Phoenix.Token.sign(MidimatchesWeb.Endpoint, "account_user_auth", found_user.uuid)
        # conn = assign(conn, :account_user_auth_token)

        conn
        |> json(%{})

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: reason})
    end
  end
end
