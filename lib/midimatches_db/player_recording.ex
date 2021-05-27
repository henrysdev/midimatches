defmodule MidimatchesDb.PlayerRecording do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "player_recordings" do
    field(:player_uuid, Ecto.UUID)
    field(:backing_track_uuid, Ecto.UUID)
    field(:recording, :map)
    field(:event_id, :id)
    field(:event_type, Ecto.Enum, values: [:round])

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:player_uuid, :backing_track_uuid, :recording, :event_id, :event_type])
    |> validate_required([:player_uuid, :backing_track_uuid, :recording])
  end
end
