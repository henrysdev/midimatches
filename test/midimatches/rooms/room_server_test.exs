defmodule Midimatches.RoomServerTest do
  use ExUnit.Case

  alias Midimatches.{
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
    room_name = "foobar"

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})
    actual_state = :sys.get_state(room_server)

    assert actual_state == %RoomServer{
             created_at: actual_state.created_at,
             players: MapSet.new(),
             game_config: %GameRules{},
             room_name: room_name,
             room_id: room_id
           }
  end

  test "add and drop players" do
    room_id = "1"
    room_name = "foobar"

    [m1, m2, m3] = [
      %Player{
        player_id: "m1",
        player_alias: "foo"
      },
      %Player{
        player_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "m3",
        player_alias: "fee"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

    RoomServer.add_player(room_server, m1)
    RoomServer.add_player(room_server, m2)
    RoomServer.add_player(room_server, m3)
    RoomServer.add_player(room_server, m3)
    RoomServer.drop_player(room_server, m1.player_id)

    players =
      room_server
      |> RoomServer.get_players()
      |> MapSet.to_list()

    expected_players = [
      %Player{player_id: "m3", player_alias: "fee"},
      %Player{player_id: "m2", player_alias: "zoo"}
    ]

    assert players == expected_players
  end

  test "add and drop audience members" do
    room_id = "1"
    room_name = "foobar"

    [m1, m2, m3] = [
      %Player{
        player_id: "m1",
        player_alias: "foo"
      },
      %Player{
        player_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "m3",
        player_alias: "fee"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

    RoomServer.add_audience_member(room_server, m1)
    RoomServer.add_audience_member(room_server, m2)
    RoomServer.add_audience_member(room_server, m3)
    RoomServer.add_audience_member(room_server, m3)
    RoomServer.drop_audience_member(room_server, m1.player_id)

    audience_members =
      room_server
      |> (&:sys.get_state(&1).audience_members).()
      |> MapSet.to_list()

    expected_audience_members = [
      %Player{player_id: "m3", player_alias: "fee"},
      %Player{player_id: "m2", player_alias: "zoo"}
    ]

    assert audience_members == expected_audience_members
  end

  test "starts game when enough players have joined" do
    room_id = "1"
    room_name = "foobar"

    players = [
      %Player{
        player_id: "m1",
        player_alias: "foo"
      },
      %Player{
        player_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "m3",
        player_alias: "fee"
      },
      %Player{
        player_id: "m4",
        player_alias: "fum"
      }
    ]

    assert is_nil(Pids.fetch({:game_supervisor, room_id}))
    room_server = start_room_with_game(room_id, room_name, players)
    state = :sys.get_state(room_server)
    assert !is_nil(state.game)
  end

  test "reset room" do
    room_id = "1"
    room_name = "foobar"

    players = [
      %Player{
        player_id: "m1",
        player_alias: "foo"
      },
      %Player{
        player_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "m3",
        player_alias: "fee"
      },
      %Player{
        player_id: "m4",
        player_alias: "fum"
      }
    ]

    room_server = start_room_with_game(room_id, room_name, players)
    game_pid = :sys.get_state(room_server).game
    game_server = Pids.fetch!({:game_server, room_id})
    game_supervisor = Pids.fetch!({:game_supervisor, room_id})

    assert Process.alive?(game_pid) == true
    assert Process.alive?(game_server) == true
    assert Process.alive?(game_supervisor) == true

    RoomServer.reset_room(room_server)

    assert Process.alive?(game_pid) == false
    assert Process.alive?(game_server) == false
    assert Process.alive?(game_server) == false
  end

  test "room full?" do
    room_id = "1"
    room_name = "foobar"

    game_config = %GameRules{
      max_players: 3
    }

    [m1, m2, m3] = [
      %Player{
        player_id: "m1",
        player_alias: "foo"
      },
      %Player{
        player_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "m3",
        player_alias: "fee"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name, game_config}]})

    RoomServer.add_player(room_server, m1)
    RoomServer.add_player(room_server, m2)
    RoomServer.add_player(room_server, m3)
    assert RoomServer.full?(room_server) == true

    RoomServer.drop_player(room_server, m1.player_id)
    assert RoomServer.full?(room_server) == false
  end

  describe "detect if room server is stale" do
    test "when room is stale" do
      now = :os.system_time(:millisecond)
      freshness_cutoff = now - 300
      server_deadline = now - 400

      room_id = "1"
      room_name = "foobar"

      {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

      :sys.replace_state(room_server, fn state ->
        %RoomServer{state | created_at: server_deadline}
      end)

      assert RoomServer.stale?(room_server, freshness_cutoff)
    end

    test "when room is not stale (by players in room)" do
      now = :os.system_time(:millisecond)
      freshness_cutoff = now - 300
      server_deadline = now - 400

      room_id = "1"
      room_name = "foobar"

      {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

      RoomServer.add_player(room_server, %Player{
        player_id: "m1",
        player_alias: "foo"
      })

      :sys.replace_state(room_server, fn state ->
        %RoomServer{state | created_at: server_deadline}
      end)

      assert !RoomServer.stale?(room_server, freshness_cutoff)
    end

    test "when room is not stale (by timestamp)" do
      now = :os.system_time(:millisecond)
      freshness_cutoff = now - 300
      server_deadline = now - 299

      room_id = "1"
      room_name = "foobar"

      {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

      :sys.replace_state(room_server, fn state ->
        %RoomServer{state | created_at: server_deadline}
      end)

      assert !RoomServer.stale?(room_server, freshness_cutoff)
    end

    test "when room is not stale (by permanent field)" do
      now = :os.system_time(:millisecond)
      freshness_cutoff = now - 300
      server_deadline = now - 400

      room_id = "1"
      room_name = "foobar"

      {:ok, room_server} =
        start_supervised({RoomServer, [{room_id, room_name, %GameRules{permanent_room: true}}]})

      :sys.replace_state(room_server, fn state ->
        %RoomServer{state | created_at: server_deadline}
      end)

      assert !RoomServer.stale?(room_server, freshness_cutoff)
    end
  end

  @type id() :: String.t()
  @spec start_room_with_game(id(), String.t(), list(%Player{})) :: pid()
  defp start_room_with_game(room_id, room_name, players) do
    game_config = %GameRules{
      min_players: length(players)
    }

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name, game_config}]})

    Enum.each(players, fn player -> RoomServer.add_player(room_server, player) end)
    room_server
  end
end
