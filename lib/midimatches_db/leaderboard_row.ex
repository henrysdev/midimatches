defmodule MidimatchesDb.LeaderboardRow do
  @moduledoc """
  Represents the structure of a row in the leaderboard (a materialized view named 'leaderboard')
  """

  use Ecto.Schema

  @derive {Jason.Encoder,
           only: [
             :username,
             :player_uuid,
             :player_rank,
             :player_score,
             :win_count,
             :tie_count,
             :loss_count,
             :total_games
           ]}
  schema "leaderboard" do
    field(:username, :string)
    field(:player_uuid, Ecto.UUID)
    field(:player_rank, :integer)
    field(:player_score, :integer)
    field(:win_count, :integer)
    field(:tie_count, :integer)
    field(:loss_count, :integer)
    field(:total_games, :integer)
  end
end
