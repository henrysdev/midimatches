defmodule Progressions.PlaybackVotingTest do
  use ExUnit.Case

  alias Progressions.Rooms.Room.{
    Game.Bracket,
    Game.Views.PlaybackVoting,
    GameServer
  }

  test "advance view through entirely simulated votes" do
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
