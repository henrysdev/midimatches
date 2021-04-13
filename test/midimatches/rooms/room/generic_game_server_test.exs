defmodule Midimatches.GenericGameServerTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GenericGameServer,
    TestHelpers,
    Types.GameRules,
    Types.GameRules.ViewTimeouts,
    Types.Player
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up new game server" do
    room_id = "1"
    game_id = "abc"

    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        },
        %Player{
          player_id: "4",
          player_alias: "fum"
        }
      ])

    musicians = MapSet.new(["1", "2", "3", "4"])
    game_rules = %GameRules{}

    {:ok, game_server} = GenericGameServer.start_link([{room_id, game_id, players, game_rules}])

    contestants =
      :sys.get_state(game_server).contestants
      |> Enum.sort()

    expected_musicians =
      musicians
      |> MapSet.to_list()
      |> Enum.sort()

    assert contestants == expected_musicians
  end

  test "get current game view" do
    room_id = "1"
    game_id = "abc"

    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        },
        %Player{
          player_id: "4",
          player_alias: "fum"
        }
      ])

    game_rules = %GameRules{}

    {:ok, game_server} = GenericGameServer.start_link([{room_id, game_id, players, game_rules}])
    game_view = GenericGameServer.get_current_view(game_server)

    assert game_view == :game_start
  end

  describe "advance from game view" do
    test "when game view is consistent with actual game view" do
      room_id = "1"
      game_id = "abc"

      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      game_rules = %GameRules{}

      {:ok, game_server} = GenericGameServer.start_link([{room_id, game_id, players, game_rules}])

      assert :ok == GenericGameServer.advance_from_game_view(game_server, :game_start, 0)
    end

    test "when game view is inconsistent with actual game view" do
      room_id = "1"
      game_id = "abc"

      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      game_rules = %GameRules{}

      {:ok, game_server} = GenericGameServer.start_link([{room_id, game_id, players, game_rules}])

      assert :error == GenericGameServer.advance_from_game_view(game_server, :recording, 0)
    end

    # TODO fix test... is flakey
    test "triggered by view timer timeouts for game_start view" do
      room_id = "1"
      game_id = "abc"

      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      game_rules = %GameRules{
        view_timeouts: %ViewTimeouts{
          round_start: 10
        }
      }

      {:ok, game_server} = GenericGameServer.start_link([{room_id, game_id, players, game_rules}])
      {:ok, _view_timer} = ViewTimer.start_link([{room_id}])

      assert GenericGameServer.get_current_view(game_server) == :game_start
      ctr = :sys.get_state(game_server).view_counter
      GenericGameServer.advance_from_game_view(game_server, :game_start, ctr)
      assert GenericGameServer.get_current_view(game_server) == :round_start
      Process.sleep(game_rules.view_timeouts.round_start + 5)
      assert GenericGameServer.get_current_view(game_server) == :recording
    end
  end
end
