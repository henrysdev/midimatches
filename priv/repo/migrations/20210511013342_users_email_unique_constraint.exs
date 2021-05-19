defmodule MidimatchesDb.Repo.Migrations.UsersEmailUniqueConstraint do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:email], name: :unique_emails)
  end
end
