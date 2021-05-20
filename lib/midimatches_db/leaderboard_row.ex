defmodule MidimatchesDb.LeaderboardRow do
  @moduledoc """
  Represents the structure of a row in the leaderboard (a materialized view named 'leaderboard')
  """

  use Ecto.Schema

  # @primary_key false
  schema "leaderboard" do
    field(:username, :string)
    field(:player_rank, :integer)
    field(:player_score, :integer)
    field(:win_count, :integer)
    field(:tie_count, :integer)
    field(:loss_count, :integer)
    field(:total_games, :integer)
  end
end
