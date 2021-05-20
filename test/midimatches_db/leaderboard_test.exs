defmodule MidimatchesDb.LeaderboardTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    Leaderboard,
    LeaderboardRow,
    PlayerOutcome,
    PlayerOutcomes,
    Users
  }

  test "create and refresh leaderboard successfully" do
    # insert several users
    users = insert_users(2)

    # insert several player_outcome rows
    outcomes = gen_player_outcomes(users, 1)
    :ok = PlayerOutcomes.bulk_create_player_outcomes(outcomes)

    # create/refresh leaderboard
    Leaderboard.refresh_leaderboard()

    # get records from leaderboard
    orig_top_players = Leaderboard.fetch_leaderboard_rows(0, 2)

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

    # add more games and refresh leaderboard
    outcomes =
      insert_users(2)
      |> gen_player_outcomes(50)

    PlayerOutcomes.bulk_create_player_outcomes(outcomes)

    Leaderboard.refresh_leaderboard()

    new_top_players = Leaderboard.fetch_leaderboard_rows(0, 10)

    assert orig_top_players != new_top_players
  end

  defp gen_player_outcomes(users, game_count) do
    1..game_count
    |> Enum.flat_map(fn game_id ->
      game_winner = Enum.random(users)

      users
      |> Enum.map(fn user ->
        if user.uuid == game_winner.uuid do
          %PlayerOutcome{
            event_type: :game,
            event_id: game_id,
            player_uuid: game_winner.uuid,
            outcome: :won,
            num_points: 10
          }
        else
          %PlayerOutcome{
            event_type: :game,
            event_id: game_id,
            player_uuid: user.uuid,
            outcome: :lost,
            num_points: 1
          }
        end
      end)
    end)
  end

  defp insert_users(n) do
    1..n
    |> Enum.map(fn _ ->
      user_params = %{
        username: random_string(8),
        password: random_string(11),
        email: random_string(8)
      }

      {:ok, inserted_user} = Users.create_user(user_params)

      inserted_user
    end)
  end

  defp random_string(size) do
    for _ <- 1..size, into: "" do
      <<Enum.random('0123456789abcdef')>>
    end
  end
end
