defmodule MidimatchesDb.RoundRecord do
  @moduledoc false

  alias MidimatchesDb.GameRecord

  use Ecto.Schema
  import Ecto.Changeset

  schema "round_records" do
    field(:round_num, :integer)
    field(:backing_track_uuid, Ecto.UUID)

    belongs_to(:game_record, GameRecord)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:round_num, :backing_track_uuid])
    |> validate_required([:round_num, :backing_track_uuid])
  end
end
