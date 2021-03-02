defmodule MidimatchesWeb.PageControllerTest do
  use MidimatchesWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "react-app"
  end

  # test "GET /practice", %{conn: conn} do
  #   conn = get(conn, "/practice")
  #   assert html_response(conn, 200) =~ "react-app"
  # end

  # test "GET /menu", %{conn: conn} do
  #   conn = get(conn, "/menu")
  #   assert html_response(conn, 200) =~ "react-app"
  # end

  describe "GET /register" do
    test "menu dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/menu")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "servers dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/servers", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "room dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/room/1idjd3", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "practice dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/practice", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end
  end
end
