defmodule Progressions.RecordingTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.Views.Recording,
    Rooms.Room.GameServer,
    Types.Player
  }

  test "advance view through entirely simulated recordings" do
    players =
      MapSet.new([
        %Player{
          musician_id: "1",
          player_alias: "foo"
        },
        %Player{
          musician_id: "2",
          player_alias: "zoo"
        },
        %Player{
          musician_id: "3",
          player_alias: "fee"
        },
        %Player{
          musician_id: "4",
          player_alias: "fum"
        }
      ])

    contestants = ["1", "2"]
    judges = ["3", "4"]
    musicians = MapSet.new(contestants ++ judges)

    game_server_state = %GameServer{
      room_id: "1",
      players: players,
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
