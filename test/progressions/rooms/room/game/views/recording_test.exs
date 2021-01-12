defmodule Progressions.RecordingTest do
  use ExUnit.Case

  alias Progressions.Rooms.Room.{
    Game.Views.Recording,
    GameServer
  }

  test "advance view through entirely simulated recordings" do
    contestants = ["1", "2"]
    judges = ["3", "4"]
    musicians = MapSet.new(contestants ++ judges)

    game_server_state = %GameServer{
      room_id: "1",
      musicians: musicians,
      game_view: :recording,
      contestants: contestants,
      judges: judges,
      recordings: %{}
    }

    %GameServer{
      recordings: recordings,
      game_view: game_view
    } = Recording.advance_view(game_server_state)

    expected_recordings = %{
      "1" => %{},
      "2" => %{}
    }

    assert recordings == expected_recordings
    assert game_view == :playback_voting
  end
end
