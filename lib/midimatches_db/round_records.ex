defmodule MidimatchesDb.RoundRecords do
  @moduledoc """
  DB boundary for RoundRecord objects
  """

  alias MidimatchesDb.{
    GameRecord,
    RoundRecord,
    Repo
  }

  @spec create_round_record(%RoundRecord{}) :: {:ok, %RoundRecord{}} | {:error, any()}
  @doc """
  Insert a new round record
  """
  def create_round_record(%RoundRecord{} = round_record) do
    Repo.insert(round_record)
  end

  @spec add_round_record_for_game(%RoundRecord{}, %GameRecord{}) ::
          {:ok, %RoundRecord{}} | {:error, any()}
  def add_round_record_for_game(round_record, game_record) do
    round_record = Ecto.build_assoc(game_record, :round_records, round_record)
    create_round_record(round_record)
  end
end
