defmodule MidimatchesDb.Repo.Migrations.UsersUuidUniqueConstraint do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:uuid], name: :unique_uuids)
  end
end
