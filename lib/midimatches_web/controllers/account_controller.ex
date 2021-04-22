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

      {:error, %{not_found: "user"}} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "user not found"})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec show(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get the user account for the specified user uuid
  """
  def show(conn, %{"uuid" => uuid}) do
    case Db.Users.get_user_by(:uuid, uuid) do
      {:ok, user} ->
        conn
        |> json(%{user: user})

      {:error, %{not_found: "user"}} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "user not found"})

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
    # TODO update user to increment token serial
    conn
  end

  defp attempt_login(conn, user_params) do
    case Db.Users.get_user_by_creds(user_params) do
      {:ok, %Db.User{uuid: user_id}} ->
        auth_token = new_auth_token(conn, user_id)

        conn
        |> json(%{auth_token: auth_token})

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: reason})
    end
  end

  # TODO move to plugs
  defp new_auth_token(conn, user_id) do
    session_id = "12"
    Phoenix.Token.sign(conn, "acct_auth_token", user_id: user_id, session_id: session_id)
    # TODO
    # 1. generate a session identifier
    # 2. store session identifier in user's row in db
    # 3. encode session identifier with user_id in token
    # Phoenix.Token.sign(conn, "acct_auth_token", user_id)
  end

  # defp valid_auth_token?(conn, token) do
  #   # TODO
  #   # 1. decode session identifier and user_id from token
  #   # 2. check that session identifier matches user's session identifier in DB
  #   # 3. if they match, token is valid. If they don't match, token is invalid.
  #   # TODO decode and check identifier against DB. If identifier is wrong, it is invalid.
  #   curr_session_id = "13"

  #   case Phoenix.Token.verify(conn, "acct_auth_token", token, max_age: 86400) do
  #     {:ok, [user_id: _user_id, session_id: ^curr_session_id]} -> false
  #     {:error, _reason} -> false
  #   end
  # end
end
