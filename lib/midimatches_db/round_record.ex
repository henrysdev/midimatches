defmodule MidimatchesDb.RoundRecord do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "round_records" do
    field(:round_num, :integer)
    field(:backing_track_id, :id)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:round_num, :backing_track_id])
    |> validate_required([:round_num, :backing_track_id])
  end
end
