defmodule MidimatchesDb.BackingTrack do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "backing_tracks" do
    field(:name, :string)
    field(:file_url, :string)
    field(:bpm, :integer)
    field(:musical_key, :string)
    field(:author, :string)
    field(:uuid, Ecto.UUID, autogenerate: true)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :file_url, :bpm, :musical_key, :author])
    |> validate_required([:name, :file_url, :bpm, :musical_key])
  end
end
