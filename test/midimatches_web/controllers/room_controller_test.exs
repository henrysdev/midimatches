defmodule MidimatchesWeb.RoomControllerTest do
  use MidimatchesWeb.ConnCase

  describe "POST /api/room" do
    test "valid request", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "absdf",
          "max_players" => 3,
          "num_rounds" => 3
        })

      assert json_response(conn, 200)["link_to_room"] =~ "/room/"
    end

    test "invalid roon_name value", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "ab",
          "max_players" => 4,
          "num_rounds" => 3
        })

      assert json_response(conn, 400)["error"] =~ "room_name"
    end

    test "invalid max_players value", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "absdf",
          "max_players" => 9999,
          "num_rounds" => 3
        })

      assert json_response(conn, 400)["error"] =~ "max_players"
    end

    test "invalid num_rounds value", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "absdf",
          "max_players" => 3,
          "num_rounds" => 9999
        })

      assert json_response(conn, 400)["error"] =~ "num_rounds"
    end
  end
end
