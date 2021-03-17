defmodule MidimatchesWeb.UserControllerTest do
  use MidimatchesWeb.ConnCase, async: true

  test "GET /api/user/self", %{conn: conn} do
    conn =
      session_conn()
      |> put_session(:user, %{user_id: "b4rt", user_alias: "chumbawumba"})
      |> get(Routes.user_path(conn, :self))

    assert json_response(conn, 200) == %{
             "user" => %{"user_id" => "b4rt", "user_alias" => "chumbawumba"}
           }
  end

  test "GET /api/user/reset", %{conn: conn} do
    conn =
      session_conn()
      |> put_session(:user, %{user_id: "b4rt", user_alias: "chumbawumba"})
      |> get(Routes.user_path(conn, :reset))

    assert json_response(conn, 200) == %{}
    assert get_session(conn, :user) == nil
  end

  describe "POST /api/user" do
    test "valid insert new user", %{conn: conn} do
      conn =
        session_conn()
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => "helloworld"}))

      assert json_response(conn, 200) == %{}
      assert get_session(conn, :user).user_alias == "helloworld"
    end

    test "valid update existing user", %{conn: conn} do
      conn =
        session_conn()
        |> put_session(:user, %{user_id: "b4rt", user_alias: "chumbawumba"})
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => "helloworld"}))

      assert json_response(conn, 200) == %{}
      assert get_session(conn, :user).user_id == "b4rt"
      assert get_session(conn, :user).user_alias == "helloworld"
    end

    test "invalid user_alias", %{conn: conn} do
      conn =
        session_conn()
        |> put_session(:user, %{user_id: "b4rt", user_alias: "chumbawumba"})
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => ""}))

      assert json_response(conn, 400)["error"] =~ "user_alias"
    end
  end
end
