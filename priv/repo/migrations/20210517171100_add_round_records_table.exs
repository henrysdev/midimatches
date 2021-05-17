defmodule MidimatchesDb.Repo.Migrations.AddRoundRecordsTable do
  use Ecto.Migration

  def up do
    create table(:round_records) do
      add :round_num, :integer, null: false
      add :backing_track_id, :id, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:round_records)
  end
end
