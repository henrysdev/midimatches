defmodule MidimatchesWeb.AccountController do
  @moduledoc """
  Provides API for user accounts stored in the users database table.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb, as: Db
  alias MidimatchesWeb.Auth

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
      {:ok, %Db.User{uuid: user_id} = created_user} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{user: created_user})

      {:error, changeset_error} ->
        bad_json_request(conn, changeset_error)
    end
  end

  @spec update(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Update the account
  """
  def update(conn, %{"uuid" => uuid} = params) do
    user_change_params = Map.delete(params, "uuid")

    case Db.Users.update_user(uuid, user_change_params) do
      {:ok, %Db.User{uuid: user_id} = updated_user} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{user: updated_user})

      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
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

      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
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

  @spec update_password(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Update the current user's password and create a new bearer token
  """
  def update_password(
        conn,
        %{
          "password" => _password
        } = user_params
      ) do
    user_id = conn.assigns[:auth_user].user_id

    case Db.Users.update_user(user_id, user_params) do
      {:ok, %Db.User{uuid: user_id} = _updated_user} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{})

      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  @spec attempt_login(Plug.Conn.t(), map) :: Plug.Conn.t()
  defp attempt_login(conn, user_params) do
    case Db.Users.get_user_by_creds(user_params) do
      {:ok, %Db.User{uuid: user_id}} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{})

      {:error, reason} ->
        bad_json_request(conn, reason, :unauthorized)
    end
  end
end
