defmodule MidimatchesDb.RoundRecords do
  @moduledoc """
  DB boundary for RoundRecord objects
  """

  alias MidimatchesDb.{
    RoundRecord,
    Repo
  }

  @spec create_round_record(%RoundRecord{}) :: %RoundRecord{}
  @doc """
  Insert a new round record
  """
  def create_round_record(%RoundRecord{} = round_record) do
    Repo.insert!(round_record)
  end
end
