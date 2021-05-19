defmodule MidimatchesDb.GameRecord do
  @moduledoc false

  alias MidimatchesDb.RoundRecord

  use Ecto.Schema
  import Ecto.Changeset

  schema "game_records" do
    field(:game_end_reason, Ecto.Enum, values: [:completed, :canceled])

    has_many(:round_records, RoundRecord)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:game_end_reason])
    |> validate_required([:game_end_reason])
  end
end
