defmodule MidimatchesWeb.AuthTest do
  use MidimatchesWeb.ConnCase

  alias MidimatchesDb, as: Db
  alias MidimatchesWeb.Auth

  test "creates new bearer token", %{conn: _conn} do
    conn = session_conn()
    user = create_default_user()

    conn =
      conn
      |> Auth.put_bearer_token(user.uuid)

    bearer_token = get_session(conn, :user_bearer_token)

    assert !is_nil(bearer_token)
  end

  test "verifies a bearer token", %{conn: _conn} do
    conn = session_conn()
    user = create_default_user()

    conn =
      conn
      |> Auth.put_bearer_token(user.uuid)
      |> Auth.auth_conn()

    bearer_token = get_session(conn, :user_bearer_token)

    conn = Auth.auth_conn(conn)

    assert %{auth_user: _} = conn.assigns
    assert !is_nil(bearer_token)
  end

  test "invalidates bearer token", %{conn: _conn} do
    conn = session_conn()
    user = create_default_user()

    conn =
      conn
      |> Auth.put_bearer_token(user.uuid)
      |> Auth.auth_conn()

    orig_bearer_token = get_session(conn, :user_bearer_token)

    conn = Auth.auth_conn(conn)

    assert %{auth_user: _} = conn.assigns
    assert !is_nil(orig_bearer_token)

    Db.Users.user_increment_session(user.uuid)

    Auth.auth_conn(conn)
  end

  test "create and validate reset token" do
    user_id = UUID.uuid4()

    reset_token = Auth.gen_reset_token(user_id)

    assert {:ok, %{"user_id" => ^user_id}} = Auth.parse_reset_token(reset_token)
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
