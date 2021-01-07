defmodule Progressions.NewGameServerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.NewGameServer,
    TestHelpers,
    Types.GameRules
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up new game server" do
    room_id = "1"
    musicians = ["1", "2", "3", "4"]
    game_rules = %GameRules{}

    {:ok, game_server} = NewGameServer.start_link([room_id, musicians, game_rules])

    bracket_contestants =
      :sys.get_state(game_server).bracket.match_ups
      |> Map.keys()
      |> Enum.sort()

    assert bracket_contestants == musicians
  end

  test "get current game view" do
    room_id = "1"
    musicians = ["1", "2", "3", "4"]
    game_rules = %GameRules{}

    {:ok, game_server} = NewGameServer.start_link([room_id, musicians, game_rules])
    game_view = NewGameServer.get_current_view(game_server)

    assert game_view == :game_start
  end
end
