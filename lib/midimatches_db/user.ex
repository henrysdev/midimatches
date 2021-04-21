defmodule MidimatchesDb.User do
  @moduledoc false

  alias Midimatches.ProfanityFilter

  use Ecto.Schema
  import Ecto.Changeset

  @min_username_len 3
  @max_username_len 20
  @min_password_len 10
  @max_password_len 32

  @derive {Jason.Encoder, only: [:username, :email, :uuid]}
  schema "users" do
    field(:username, :string)
    field(:email, :string)
    field(:password, :string)
    field(:uuid, Ecto.UUID, autogenerate: true)
    # TODO add verified boolean flag for email

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password])
    |> validate_required([:username, :email, :password])
    |> validate_length(:username, min: @min_username_len, max: @max_username_len)
    |> validate_length(:password, min: @min_password_len, max: @max_password_len)
    |> validate_language(:username)
    |> unique_constraint(:unique_username_constraint, name: :unique_usernames)
    |> unique_constraint(:unique_uuid_constraint, name: :unique_uuids)
    |> hash_password()
  end

  # TODO factor out these functions to imported module(s)
  defp hash_password(%{changes: %{password: password}} = changeset) do
    change(changeset, Bcrypt.add_hash(password, hash_key: :password))
  end

  defp hash_password(changeset), do: changeset

  defp validate_language(changeset, field, options \\ []) do
    validate_change(changeset, field, fn _, val ->
      if ProfanityFilter.contains_profanity?(val) do
        [{field, options[:message] || "profane language detected"}]
      else
        []
      end
    end)
  end
end
