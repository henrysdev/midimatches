defmodule MidimatchesWeb.AuthTest do
  use MidimatchesWeb.ConnCase
  use MidimatchesDb.RepoCase

  alias MidimatchesDb, as: Db
  alias MidimatchesWeb.Auth

  test "creates new bearer token", %{conn: conn} do
    user = create_default_user()

    updated_assigns = Auth.new_bearer_token(conn, user).assigns

    assert %{user_bearer_token: _} = updated_assigns
  end

  test "verifies a bearer token", %{conn: conn} do
    user = create_default_user()
    conn = add_token(conn, user)

    assigns = Auth.verify_bearer_token(conn, %{}).assigns

    assert %{user_bearer_token: conn.assigns.user_bearer_token, auth_user_id: user.uuid} ==
             assigns
  end

  test "invalidates bearer token", %{conn: conn} do
    user = create_default_user()
    conn = add_token(conn, user)

    orig_bearer_token = conn.assigns.user_bearer_token

    Db.Users.user_increment_session(user.uuid)

    assigns = Auth.verify_bearer_token(conn, %{}).assigns

    assert :auth_user_id not in assigns

    assert %{user_bearer_token: ^orig_bearer_token} = assigns
  end

  defp add_token(conn, user) do
    Auth.new_bearer_token(conn, user)
  end

  defp create_default_user do
    user_params = %{
      username: "jazzyman",
      password: "abcdef1234!",
      email: "eeaasdg@gmasgd.com"
    }

    {:ok, user} = Db.Users.create_user(user_params)
    user
  end
end
