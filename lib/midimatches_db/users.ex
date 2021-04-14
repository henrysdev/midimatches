defmodule MidimatchesDb.Users do
  @moduledoc """
  DB boundary for User objects
  """

  import Ecto.Changeset

  alias MidimatchesDb.{
    Repo,
    User
  }

  @spec create_user(%User{}) :: %User{}
  @doc """
  Insert a new user
  """
  def create_user(%User{pass_hash: password} = user) do
    user
    |> change(Bcrypt.add_hash(password, hash_key: :pass_hash))
    |> Repo.insert!()
  end
end
