defmodule MidimatchesDb.Repo.Migrations.AddPlayerRecordingsTable do
  use Ecto.Migration

  def up do
    create table(:player_recordings) do
      add :event_id, :id
      add :event_type, :event_type
      add :player_uuid, :uuid, null: false
      add :backing_track_uuid, :uuid, null: false
      add :recording, :map, default: %{}

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:player_recordings)
  end
end
