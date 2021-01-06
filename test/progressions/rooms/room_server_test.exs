defmodule Progressions.RoomServerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.RoomServer,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up room server" do
    room_id = "1"

    {:ok, room_server} = start_supervised({RoomServer, [{room_id}]})

    assert :sys.get_state(room_server) == %RoomServer{
             players: MapSet.new(),
             game_config: nil,
             room_id: {room_id}
           }
  end

  test "add and drop players" do
    room_id = "1"

    {:ok, room_server} = start_supervised({RoomServer, [{room_id}]})

    RoomServer.add_player(room_server, "m1")
    RoomServer.add_player(room_server, "m2")
    RoomServer.add_player(room_server, "m3")
    RoomServer.add_player(room_server, "m3")
    RoomServer.drop_player(room_server, "m1")

    players =
      room_server
      |> RoomServer.get_players()
      |> MapSet.to_list()

    expected_players = ["m2", "m3"]

    assert players == expected_players
  end
end
