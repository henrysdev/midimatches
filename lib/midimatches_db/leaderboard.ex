defmodule MidimatchesDb.Leaderboard do
  @moduledoc """
  DB boundary for interacting with the leaderboard
  """

  alias MidimatchesDb.{
    LeaderboardRow,
    Repo
  }

  import Ecto.Query

  @spec fetch_leaderboard_rows(integer(), integer()) :: {list(LeaderboardRow), integer()}
  @doc """
  Returns results from the leaderboard table for the given limit/offset pagination.
  """
  def fetch_leaderboard_rows(offset, limit) when is_integer(limit) and is_integer(offset) do
    query =
      from(lr in LeaderboardRow,
        where: lr.id > ^offset,
        limit: ^limit
      )

    results = Repo.all(query)

    count = Repo.one(from(lr in LeaderboardRow, select: fragment("COUNT(*)")))

    {results, count}
  end

  @spec refresh_leaderboard() :: :ok | {:error, any()}
  @doc """
  Trigger refresh of the leaderboard table.
  """
  def refresh_leaderboard do
    sql_file = """
    -- Refresh aggregate statistic temp table for number of games won
    DROP TABLE IF EXISTS games_won;
    CREATE TABLE games_won AS
    SELECT COUNT(*), player_uuid, outcome
    FROM public.player_outcomes
    WHERE "event_type" = 'game' AND "outcome" = 'won' AND num_points > 0
    GROUP BY player_uuid, outcome
    ORDER BY sum(num_points);
    ALTER TABLE games_won RENAME COLUMN count TO win_count;

    -- Refresh an aggregate statistic temp table for number of games tied
    DROP TABLE IF EXISTS games_tied;
    CREATE TABLE games_tied AS
    SELECT COUNT(*), player_uuid, outcome
    FROM public.player_outcomes
    WHERE "event_type" = 'game' AND "outcome" = 'tied'
    GROUP BY player_uuid, outcome
    ORDER BY sum(num_points);
    ALTER TABLE games_tied RENAME COLUMN count TO tie_count;

    -- Refresh an aggregate statistic temp table for number of games lost
    DROP TABLE IF EXISTS games_lost;
    CREATE TABLE games_lost AS
    SELECT COUNT(*), player_uuid, outcome
    FROM public.player_outcomes
    WHERE "event_type" = 'game' AND "outcome" = 'lost'
    GROUP BY player_uuid, outcome
    ORDER BY sum(num_points);
    ALTER TABLE games_lost RENAME COLUMN count TO loss_count;

    -- Refresh an aggregate statistic temp table for number of games played
    DROP TABLE IF EXISTS games_played;
    CREATE TABLE games_played AS
    SELECT COUNT(*), player_uuid
    FROM public.player_outcomes
    WHERE "event_type" = 'game'
    GROUP BY player_uuid;
    ALTER TABLE games_played RENAME COLUMN count TO total_games;

    -- Refresh an aggregate statistic temp table for player scores
    DROP TABLE IF EXISTS player_scores;
    CREATE TABLE player_scores AS
    SELECT
      COALESCE(games_won.win_count, 0) * 100 +
        COALESCE(games_tied.tie_count, 0) * 50 +
        COALESCE(games_lost.loss_count, 0) * 10 AS player_score,
      u.uuid AS player_uuid
    FROM users u
    LEFT OUTER JOIN games_won ON (u.uuid = games_won.player_uuid)
    LEFT OUTER JOIN games_tied ON (u.uuid = games_tied.player_uuid)
    LEFT OUTER JOIN games_lost ON (u.uuid = games_lost.player_uuid);

    -- Refresh leaderboard table by joining the temp tables for different stats
    DROP TABLE IF EXISTS leaderboard;
    CREATE TABLE leaderboard AS
    SELECT
      DENSE_RANK() OVER (
        ORDER BY (
          player_score,
          win_count,
          tie_count,
          total_games
          ) DESC
      ) player_rank,

      u.username,
      u.uuid AS player_id,

      COALESCE(games_won.win_count, 0) AS win_count,
      COALESCE(games_tied.tie_count, 0) AS tie_count,
      COALESCE(games_lost.loss_count, 0) AS loss_count,
      COALESCE(games_played.total_games, 0) AS total_games,
      COALESCE(player_scores.player_score, 0) AS player_score

    FROM users u
    LEFT OUTER JOIN games_won ON (u.uuid = games_won.player_uuid)
    LEFT OUTER JOIN games_tied ON (u.uuid = games_tied.player_uuid)
    LEFT OUTER JOIN games_lost ON (u.uuid = games_lost.player_uuid)
    LEFT OUTER JOIN games_played ON (u.uuid = games_played.player_uuid)
    LEFT OUTER JOIN player_scores ON (u.uuid = player_scores.player_uuid)
    WHERE u.registered = true
    ORDER BY player_rank ASC;
    ALTER TABLE leaderboard ADD COLUMN id SERIAL PRIMARY KEY;

    DROP TABLE IF EXISTS player_scores;
    DROP TABLE IF EXISTS games_played;
    DROP TABLE IF EXISTS games_lost;
    DROP TABLE IF EXISTS games_tied;
    DROP TABLE IF EXISTS games_won;
    """

    sql_file
    |> String.split(";")
    |> Enum.map(fn s -> s <> ";" end)
    |> Enum.each(&Repo.query!/1)
  end
end
