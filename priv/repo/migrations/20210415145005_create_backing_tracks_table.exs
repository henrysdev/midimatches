defmodule MidimatchesDb.Repo.Migrations.CreateBackingTracksTable do
  use Ecto.Migration

  def up do
    create table(:backing_tracks) do
      add :uuid, :uuid, null: false
      add :name, :string, null: false
      add :file_url, :string, null: false
      add :bpm, :integer, null: false
      add :musical_key, :string, null: false
      add :author, :string

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:backing_tracks)
  end
end
