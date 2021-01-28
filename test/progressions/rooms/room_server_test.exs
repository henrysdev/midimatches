defmodule Progressions.RoomServerTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.RoomServer,
    TestHelpers,
    Types.GameRules,
    Types.Player
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
             game_config: %GameRules{},
             room_id: room_id
           }
  end

  test "add and drop players" do
    room_id = "1"

    [m1, m2, m3] = [
      %Player{
        musician_id: "m1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "m3",
        player_alias: "fee"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id}]})

    RoomServer.add_player(room_server, m1)
    RoomServer.add_player(room_server, m2)
    RoomServer.add_player(room_server, m3)
    RoomServer.add_player(room_server, m3)
    RoomServer.drop_player(room_server, m1)

    players =
      room_server
      |> RoomServer.get_players()
      |> MapSet.to_list()

    expected_players = [
      %Player{musician_id: "m2", player_alias: "zoo"},
      %Player{musician_id: "m3", player_alias: "fee"}
    ]

    assert players == expected_players
  end

  test "starts game when enough players have joined" do
    room_id = "1"

    game_config = %GameRules{
      game_size_num_players: 4
    }

    [m1, m2, m3, m4] = [
      %Player{
        musician_id: "m1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "m3",
        player_alias: "fee"
      },
      %Player{
        musician_id: "m4",
        player_alias: "fum"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, game_config}]})

    RoomServer.add_player(room_server, m1)
    RoomServer.add_player(room_server, m2)
    RoomServer.add_player(room_server, m3)
    assert is_nil(Pids.fetch({:game_supervisor, room_id}))
    state = RoomServer.add_player(room_server, m4)
    assert !is_nil(state.game)
  end
end
