defmodule MidimatchesDb.LeaderboardTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    Leaderboard,
    LeaderboardRow
  }

  alias Midimatches.TestHelpers

  test "create and refresh leaderboard successfully" do
    %{
      users: _users,
      game_outcomes: _outcomes
    } = TestHelpers.populate_leaderboards(2, 1)

    # get records from leaderboard
    {orig_top_players, 2} = Leaderboard.fetch_leaderboard_rows(0, 2)

    assert [
             %LeaderboardRow{
               id: 1,
               loss_count: 0,
               player_rank: 1,
               player_score: 100,
               tie_count: 0,
               total_games: 1,
               win_count: 1
             },
             %LeaderboardRow{
               id: 2,
               loss_count: 1,
               player_rank: 2,
               player_score: 10,
               tie_count: 0,
               total_games: 1,
               win_count: 0
             }
           ] = orig_top_players

    %{
      users: _users,
      game_outcomes: _outcomes
    } = TestHelpers.populate_leaderboards(2, 50)

    Leaderboard.refresh_leaderboard()

    {new_top_players, 4} = Leaderboard.fetch_leaderboard_rows(0, 10)

    assert orig_top_players != new_top_players
  end
end
