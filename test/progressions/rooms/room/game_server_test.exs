defmodule Progressions.GameServerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameServer,
    TestHelpers,
    Types.GameRules
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up new game server" do
    room_id = "1"
    musicians = MapSet.new(["1", "2", "3", "4"])
    game_rules = %GameRules{}

    {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])

    bracket_contestants =
      :sys.get_state(game_server).bracket.match_ups
      |> Map.keys()
      |> Enum.sort()

    expected_musicians =
      musicians
      |> MapSet.to_list()
      |> Enum.sort()

    assert bracket_contestants == expected_musicians
  end

  test "get current game view" do
    room_id = "1"
    musicians = MapSet.new(["1", "2", "3", "4"])
    game_rules = %GameRules{}

    {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])
    game_view = GameServer.get_current_view(game_server)

    assert game_view == :game_start
  end

  describe "advance from game view" do
    test "when game view is consistent with actual game view" do
      room_id = "1"
      musicians = MapSet.new(["1", "2", "3", "4"])
      game_rules = %GameRules{}

      {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])

      assert :ok == GameServer.advance_from_game_view(game_server, :game_start, 0)
    end

    test "when game view is inconsistent with actual game view" do
      room_id = "1"
      musicians = MapSet.new(["1", "2", "3", "4"])
      game_rules = %GameRules{}

      {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])

      assert :error == GameServer.advance_from_game_view(game_server, :recording, 0)
    end

    # TODO fix test... is flakey
    test "triggered by view timer timeouts for game_start view" do
      room_id = "1"
      musicians = MapSet.new(["1", "2", "3", "4"])

      game_rules = %GameRules{
        view_timeouts: %{
          round_start: 10
        }
      }

      {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])
      {:ok, _view_timer} = ViewTimer.start_link([{room_id}])

      assert GameServer.get_current_view(game_server) == :game_start
      ctr = :sys.get_state(game_server).view_counter
      GameServer.advance_from_game_view(game_server, :game_start, ctr)
      assert GameServer.get_current_view(game_server) == :round_start
      Process.sleep(game_rules.view_timeouts.round_start + 5)
      assert GameServer.get_current_view(game_server) == :recording
    end
  end
end
