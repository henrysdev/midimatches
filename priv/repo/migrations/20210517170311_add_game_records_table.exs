defmodule MidimatchesDb.Repo.Migrations.AddGameRecordsTable do
  use Ecto.Migration

  def up do
    execute("CREATE TYPE game_end_reason AS ENUM ('completed', 'canceled')")

    create table(:game_records) do
      add :game_end_reason, :game_end_reason, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:game_records)
    execute("DROP TYPE IF EXISTS game_end_reason")
  end
end
