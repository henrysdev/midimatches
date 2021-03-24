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

    test "invalid roon_name value due to length", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "ab",
          "max_players" => 4,
          "num_rounds" => 3
        })

      resp = json_response(conn, 400)
      error = resp["error"]
      assert error =~ "room_name"
      assert error =~ "invalid_length"
    end

    test "invalid roon_name value due to profanity", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "ab hell",
          "max_players" => 4,
          "num_rounds" => 3
        })

      resp = json_response(conn, 400)
      error = resp["error"]
      assert error =~ "room_name"
      assert error =~ "profanity"
    end

    test "invalid max_players value", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "absdf",
          "max_players" => 9999,
          "num_rounds" => 3
        })

      resp = json_response(conn, 400)
      error = resp["error"]
      assert error =~ "max_players"
      assert error =~ "out_of_valid_range"
    end

    test "invalid num_rounds value", %{conn: conn} do
      conn =
        post(conn, "/api/room", %{
          "room_name" => "absdf",
          "max_players" => 3,
          "num_rounds" => 9999
        })

      resp = json_response(conn, 400)
      error = resp["error"]
      assert error =~ "num_rounds"
      assert error =~ "out_of_valid_range"
    end
  end
end
