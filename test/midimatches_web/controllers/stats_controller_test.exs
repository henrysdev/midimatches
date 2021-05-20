defmodule MidimatchesWeb.StatsControllerTest do
  use MidimatchesWeb.ConnCase

  alias Midimatches.TestHelpers

  describe "GET /api/stats/rankings" do
    test "returns expected leaderboard rows for query", %{conn: conn} do
      %{game_outcomes: game_outcomes} = TestHelpers.populate_leaderboards(2, 1)

      winner_uuid =
        (game_outcomes
         |> Enum.find(fn game_outcome -> game_outcome.outcome == :won end)).player_uuid

      conn =
        get(
          conn,
          Routes.stats_path(conn, :rankings, %{
            "offset" => 0,
            "limit" => 10
          })
        )

      resp = json_response(conn, 200)

      assert %{
               "count" => 2,
               "player_rankings" => [
                 %{
                   "loss_count" => 0,
                   "player_rank" => 1,
                   "player_score" => 100,
                   "tie_count" => 0,
                   "total_games" => 1,
                   "player_uuid" => ^winner_uuid,
                   "win_count" => 1
                 },
                 %{
                   "loss_count" => 1,
                   "player_rank" => 2,
                   "player_score" => 10,
                   "tie_count" => 0,
                   "total_games" => 1,
                   "win_count" => 0
                 }
               ]
             } = resp
    end

    test "fails with bad response when called with invalid params", %{conn: conn} do
      conn =
        get(
          conn,
          Routes.stats_path(conn, :rankings, %{
            "offset" => 0,
            "limit" => 12_124_124_124_124
          })
        )

      resp = json_response(conn, 400)

      assert resp == %{
               "error" =>
                 "\"invalid parameters, offset and limit must be integers in range 0-100\""
             }
    end
  end
end
