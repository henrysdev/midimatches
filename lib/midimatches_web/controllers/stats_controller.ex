defmodule MidimatchesWeb.StatsController do
  @moduledoc """
  Provides JSON API for samples.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb, as: Db

  @spec rankings(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Gets paginated rankings content for leaderboard
  """
  def rankings(conn, %{"offset" => offset, "limit" => limit}) do
    with {offset, ""} <- Integer.parse(offset),
         {limit, ""} <- Integer.parse(limit),
         true <- (fn -> offset >= 0 and limit >= 0 and limit < 100 end).() do
      {rows, count} = Db.Leaderboard.fetch_leaderboard_rows(offset, limit)
      json(conn, %{"player_rankings" => rows, "count" => count})
    else
      _ ->
        reason = "invalid parameters, offset and limit must be integers in range 0-100"
        bad_json_request(conn, reason)
    end
  end
end
