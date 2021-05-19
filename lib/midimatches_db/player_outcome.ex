defmodule MidimatchesDb.PlayerOutcome do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "player_outcomes" do
    field(:event_id, :id)
    field(:event_type, Ecto.Enum, values: [:game, :round])
    field(:player_uuid, Ecto.UUID)
    field(:outcome, Ecto.Enum, values: [:won, :lost, :tied])
    field(:num_points, :integer, default: 0)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:event_id, :event_type, :player_uuid, :outcome, :num_points])
    |> validate_required([:event_id, :event_type, :player_uuid, :outcome, :num_points])
  end
end
