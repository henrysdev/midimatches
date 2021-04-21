defmodule MidimatchesDb.Repo.Migrations.UsersUsernameUniqueConstraint do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:username], name: :unique_usernames)
  end
end
