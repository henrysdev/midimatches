defmodule MidimatchesDb.User do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field(:username, :string)
    field(:email, :string)
    field(:pass_hash, :string)
    field(:uuid, Ecto.UUID, autogenerate: true)
    # TODO add verified boolean flag for email

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :pass_hash])
    |> validate_required([:username, :email, :pass_hash])
  end
end
