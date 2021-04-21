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

  @spec update(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Update the account
  """
  def update(conn, %{"uuid" => uuid} = params) do
    user_change_params = Map.delete(params, "uuid")
    # TODO obtain user_id from authenticated session
    case Db.Users.update_user(uuid, user_change_params) do
      {:ok, updated_user} ->
        # TODO logout the user on account update
        conn
        |> json(%{user: updated_user})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec login(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Login to a user account and start an authenticated session
  """
  def login(conn, %{"username" => username, "password" => password}) do
    attempt_login(conn, %{username: username, password: password})
  end

  def login(conn, %{"email" => email, "password" => password}) do
    attempt_login(conn, %{email: email, password: password})
  end

  @spec logout(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  End the current authenticated user session if one is active
  """
  def logout(conn, _params) do
    # TODO remove auth session from conn struct
    conn
  end

  defp attempt_login(conn, user_params) do
    case Db.Users.get_user_by_creds(user_params) do
      {:ok, _found_user} ->
        # TODO assign auth session to conn struct
        conn
        |> json(%{})

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: reason})
    end
  end
end
