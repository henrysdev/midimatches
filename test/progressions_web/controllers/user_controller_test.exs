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
end
