defmodule Midimatches.PlaybackVotingTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.Game.Views.PlaybackVoting,
    Rooms.Room.GameServer,
    Types.Player,
    Types.WinResult
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

  test "votes to win result" do
    votes = %{
      "a" => "c",
      "c" => "b",
      "b" => "c",
      "d" => "b",
      "e" => "d"
    }

    current_players =
      MapSet.new([
        "a",
        "d",
        "e"
      ])

    actual_win_result = PlaybackVoting.votes_to_win_result(votes, current_players)

    expected_win_result = %WinResult{
      winners: ["d"],
      num_points: 1
    }

    assert actual_win_result == expected_win_result
  end
end
