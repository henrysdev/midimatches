defmodule ProgressionsWeb.UserControllerTest do
  use ProgressionsWeb.ConnCase

  test "POST /user/register", %{conn: conn} do
    conn = post(conn, Routes.user_path(conn, :register), %{"user_alias" => "chumbawumba"})

    assert %{
             "user" => %{
               "user_alias" => "chumbawumba",
               "user_id" => _
             }
           } = json_response(conn, 200)
  end
end
