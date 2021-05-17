defmodule MidimatchesDb.Repo.Migrations.AddPlayerOutcomesTable do
  use Ecto.Migration

  def up do
    execute("CREATE TYPE event_type AS ENUM ('game', 'round')")
    execute("CREATE TYPE outcome AS ENUM ('won', 'lost', 'tied')")

    create table(:player_outcomes) do
      add :event_id, :id, null: false
      add :event_type, :event_type, null: false
      add :player_uuid, :uuid, null: false
      add :outcome, :outcome, null: false
      add :num_points, :integer

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:player_outcomes)
    execute("DROP TYPE IF EXISTS outcome")
    execute("DROP TYPE IF EXISTS event_type")
  end
end
