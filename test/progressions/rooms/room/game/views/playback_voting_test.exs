defmodule Progressions.PlaybackVotingTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.Views.PlaybackVoting,
    Rooms.Room.GameServer,
    Types.Player
  }

  test "advance view through entirely simulated votes" do
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

    contestants = ["1", "2", "3", "4"]
    musicians = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      musicians: musicians,
      game_view: :playback_voting,
      contestants: contestants,
      votes: %{}
    }

    %GameServer{
      votes: votes
    } = PlaybackVoting.advance_view(game_server_state)

    expected_contestants =
      votes
      |> Map.values()
      |> Enum.map(&Enum.member?(contestants, &1))

    assert expected_contestants == [true, true, true, true]
  end

  test "update scores accuractely" do
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

    contestants = ["1", "2", "3", "4"]
    musicians = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      musicians: musicians,
      game_view: :playback_voting,
      contestants: contestants,
      scores: %{"1" => 3, "2" => 0, "3" => 1, "4" => 0},
      votes: %{"1" => "2", "2" => "4", "4" => "2", "3" => "1"}
    }

    actual_scores = PlaybackVoting.update_scores(game_server_state).scores
    expected_scores = %{"1" => 4, "2" => 2, "3" => 1, "4" => 1}

    assert actual_scores == expected_scores
  end
end
