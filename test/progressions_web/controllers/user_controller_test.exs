defmodule ProgressionsWeb.UserControllerTest do
  use ProgressionsWeb.ConnCase, async: true

  test "POST /api/user/register", %{conn: conn} do
    conn = post(conn, Routes.user_path(conn, :register), %{"user_alias" => "chumbawumba"})

    assert json_response(conn, 200) == %{}
    assert %{user_id: _, user_alias: "chumbawumba"} = get_session(conn, :user)
  end

  test "GET /api/user/self", %{conn: conn} do
    conn =
      session_conn()
      |> put_session(:user, %{user_id: "b4rt", user_alias: "chumbawumba"})
      |> get(Routes.user_path(conn, :self))

    assert json_response(conn, 200) == %{
             "user" => %{"user_id" => "b4rt", "user_alias" => "chumbawumba"}
           }
  end
end
