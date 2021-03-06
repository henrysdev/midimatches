defmodule Midimatches.BracketTest do
  use ExUnit.Case

  alias Midimatches.Rooms.Room.Game.Bracket

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

    {_bracket, winners_scan} =
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

  test "remaining matches returns only unplayed matches" do
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

    winners = ["1", "3", "5"]

    {_bracket, remaining_matches_scan} =
      Enum.reduce(
        winners,
        {bracket, [Bracket.remaining_matches(bracket)]},
        fn x, {b, remaining_matches_scan} ->
          b = Bracket.record_winner(b, x)
          {b, [Bracket.remaining_matches(b) | remaining_matches_scan]}
        end
      )

    expected_remaining_matches_scan = [
      [["1", "2"], ["3", "4"], ["5", "6"], ["7", "8"]],
      [["3", "4"], ["5", "6"], ["7", "8"]],
      [["5", "6"], ["7", "8"]],
      [["7", "8"]]
    ]

    assert Enum.reverse(remaining_matches_scan) == expected_remaining_matches_scan
  end
end
