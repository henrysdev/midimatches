defmodule MidimatchesDb.GameRecords do
  @moduledoc """
  DB boundary for GameRecord objects
  """

  alias MidimatchesDb.{
    GameRecord,
    Repo
  }

  @spec create_game_record(%GameRecord{}) :: %GameRecord{}
  @doc """
  Insert a new game record
  """
  def create_game_record(%GameRecord{} = game_record) do
    Repo.insert!(game_record)
  end
end
