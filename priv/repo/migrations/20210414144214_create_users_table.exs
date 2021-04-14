defmodule MidimatchesDb.Repo.Migrations.CreateUsersTable do
  use Ecto.Migration

  def up do
    create table(:users) do
      add :uuid, :uuid, null: false
      add :username, :string, null: false
      add :email, :string, null: false
      add :pass_hash, :string, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end

  def down do
    drop table(:users)
  end
end
