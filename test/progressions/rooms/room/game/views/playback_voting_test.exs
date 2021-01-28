defmodule Progressions.PlaybackVotingTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.Bracket,
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

    contestants = ["1", "2"]
    judges = ["3", "4"]
    musicians = MapSet.new(contestants ++ judges)

    bracket = %Bracket{
      match_ups: %{
        "1" => ["1", "2"],
        "2" => ["1", "2"]
      }
    }

    game_server_state = %GameServer{
      room_id: "1",
      players: players,
      musicians: musicians,
      game_view: :playback_voting,
      contestants: contestants,
      judges: judges,
      bracket: bracket,
      votes: %{}
    }

    %GameServer{
      votes: votes,
      winner: {winner, _vote_count}
    } = PlaybackVoting.advance_view(game_server_state)

    expected_contestants =
      votes
      |> Map.values()
      |> Enum.map(&Enum.member?(contestants, &1))

    assert expected_contestants == [true, true]
    assert Enum.member?(contestants, winner)
  end
end
