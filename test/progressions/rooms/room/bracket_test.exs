defmodule Progressions.BracketTest do
  use ExUnit.Case

  alias Progressions.Rooms.Room.Bracket

  test "build new bracket" do
    musicians =
      1..16
      |> Enum.to_list()
      |> Enum.map(&Integer.to_string/1)

    bracket = Bracket.new_bracket(musicians)

    assert map_size(bracket.match_ups) == 16
    assert MapSet.size(bracket.winners) == 0
  end

  test "record bracket winners and advance to next round" do
    musicians =
      1..8
      |> Enum.to_list()
      |> Enum.map(&Integer.to_string/1)

    bracket = %Bracket{
      match_ups: %{
        "1" => ["1", "2"],
        "2" => ["1", "2"],
        "3" => ["3", "4"],
        "4" => ["3", "4"],
        "5" => ["5", "6"],
        "6" => ["5", "6"],
        "7" => ["7", "8"],
        "8" => ["7", "8"]
      },
      wins_to_advance: 4
    }

    winners = ["1", "3", "5", "8"]

    {bracket, winners_scan} =
      Enum.reduce(
        winners,
        {bracket, []},
        fn x, {b, winners_scan} ->
          b = Bracket.record_winner(b, x)
          {b, [MapSet.to_list(b.winners) | winners_scan]}
        end
      )

    expected_winners_scan = [["1"], ["1", "3"], ["1", "3", "5"], []]

    assert Enum.reverse(winners_scan) == expected_winners_scan
  end

  test "final round yields final winner" do
    musicians = ["1", "2"]

    bracket = %Bracket{
      match_ups: %{
        "1" => ["1", "2"],
        "2" => ["1", "2"]
      },
      wins_to_advance: 1
    }

    winner = "1"

    bracket = Bracket.record_winner(bracket, winner)

    assert bracket.final_winner == winner
  end
end
