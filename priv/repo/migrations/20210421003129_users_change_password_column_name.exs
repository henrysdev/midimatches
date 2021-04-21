defmodule MidimatchesDb.Repo.Migrations.UsersChangePasswordColumnName do
  use Ecto.Migration

  def change do
    rename table(:users), :pass_hash, to: :password
  end
end
