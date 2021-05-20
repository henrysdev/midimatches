defmodule MidimatchesDb.Leaderboard do
  @moduledoc """
  DB boundary for interacting with the leaderboard
  """

  alias MidimatchesDb.{
    LeaderboardRow,
    Repo
  }

  import Ecto.Query

  @spec fetch_leaderboard_rows(integer(), integer()) :: list(LeaderboardRow)
  @doc """
  Returns results from the leaderboard table for the given limit/offset pagination.
  """
  def fetch_leaderboard_rows(offset, limit) when is_integer(limit) and is_integer(offset) do
    query =
      from(lr in LeaderboardRow,
        where: lr.player_rank > ^offset,
        limit: ^limit
      )

    Repo.all(query)
  end

  @spec refresh_leaderboard() :: :ok | {:error, any()}
  @doc """
  Trigger refresh of the leaderboard table.
  """
  def refresh_leaderboard do
    [
      """
      DROP TABLE IF EXISTS games_won;
      """,
      """
      CREATE TEMPORARY TABLE games_won AS
      SELECT COUNT(*), player_uuid, outcome
      FROM public.player_outcomes
      WHERE "outcome" = 'won'
      GROUP BY player_uuid, outcome
      ORDER BY sum(num_points);
      """,
      """
      ALTER TABLE games_won RENAME COLUMN count TO win_count;
      """,
      """
      DROP TABLE IF EXISTS games_tied;
      """,
      """
      CREATE TEMPORARY TABLE games_tied AS
      SELECT COUNT(*), player_uuid, outcome
      FROM public.player_outcomes
      WHERE "outcome" = 'tied'
      GROUP BY player_uuid, outcome
      ORDER BY sum(num_points);
      """,
      """
      ALTER TABLE games_tied RENAME COLUMN count TO tie_count;
      """,
      """
      DROP TABLE IF EXISTS games_lost;
      """,
      """
      CREATE TEMPORARY TABLE games_lost AS
      SELECT COUNT(*), player_uuid, outcome
      FROM public.player_outcomes
      WHERE "outcome" = 'lost'
      GROUP BY player_uuid, outcome
      ORDER BY sum(num_points);
      """,
      """
      ALTER TABLE games_lost RENAME COLUMN count TO loss_count;
      """,
      """
      DROP TABLE IF EXISTS games_played;
      """,
      """
      CREATE TEMPORARY TABLE games_played AS
      SELECT COUNT(*), player_uuid
      FROM public.player_outcomes
      GROUP BY player_uuid;
      """,
      """
      ALTER TABLE games_played RENAME COLUMN count TO total_games;
      """,
      """
      DROP TABLE IF EXISTS leaderboard;
      """,
      """
      CREATE TABLE leaderboard AS
      SELECT
        DENSE_RANK() OVER (
          ORDER BY (
            -- calculate player score
            COALESCE(games_won.win_count, 0) * 100 +
              COALESCE(games_tied.tie_count, 0) * 50 +
              COALESCE(games_lost.loss_count, 0) * 10,
            win_count,
            tie_count,
            total_games
            ) DESC
        ) player_rank,

        u.username,
        -- calculate player scores (TODO factor out redundant calculation)
        COALESCE(games_won.win_count, 0) * 100 +
          COALESCE(games_tied.tie_count, 0) * 50 +
          COALESCE(games_lost.loss_count, 0) * 10 AS player_score,

        COALESCE(games_won.win_count, 0) AS win_count,
        COALESCE(games_tied.tie_count, 0) AS tie_count,
        COALESCE(games_lost.loss_count, 0) AS loss_count,
        COALESCE(games_played.total_games, 0) AS total_games

      FROM users u
      LEFT OUTER JOIN games_won ON (u.uuid = games_won.player_uuid)
      LEFT OUTER JOIN games_tied ON (u.uuid = games_tied.player_uuid)
      LEFT OUTER JOIN games_lost ON (u.uuid = games_lost.player_uuid)
      LEFT OUTER JOIN games_played ON (u.uuid = games_played.player_uuid)
      WHERE u.registered = true
      ORDER BY player_rank ASC;
      """,
      """
      ALTER TABLE leaderboard ADD COLUMN id SERIAL PRIMARY KEY;
      """
    ]
    |> Enum.each(&Repo.query/1)
  end
end
