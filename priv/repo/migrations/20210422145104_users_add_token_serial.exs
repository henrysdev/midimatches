defmodule MidimatchesDb.Repo.Migrations.UsersAddTokenSerial do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :token_serial, :integer, null: false, default: 0
    end
  end
end
