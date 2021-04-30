defmodule MidimatchesDb.Repo.Migrations.UsersAddAnonUsers do
  use Ecto.Migration

  def up do
    alter table(:users) do
      modify :email, :string, null: true
      modify :password, :string, null: true
      add :registered, :boolean, null: false, default: true
    end
  end

  def down do
    alter table(:users) do
      modify :email, :string, null: false
      modify :password, :string, null: false
      remove :registered
    end
  end
end
