defmodule MidimatchesDb.User do
  @moduledoc false

  alias Midimatches.ProfanityFilter

  use Ecto.Schema
  import Ecto.Changeset

  @min_username_len 3
  @max_username_len 20
  @min_password_len 10
  @max_password_len 256

  @derive {Jason.Encoder, only: [:username, :email, :uuid, :registered]}
  schema "users" do
    field(:username, :string)
    field(:email, :string)
    field(:password, :string)
    field(:uuid, Ecto.UUID, autogenerate: true)
    field(:token_serial, :integer, default: 0)
    field(:registered, :boolean, default: false)
    # TODO add verified boolean flag for email

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password, :registered])
    |> validate_required_change_exclusion([:uuid, :token_serial])
    |> validate_required([:username, :email, :password])
    |> field_validations()
    |> hash_password()
  end

  def unregistered_changeset(user, attrs) do
    user
    |> cast(attrs, [:username])
    |> validate_required_change_exclusion([:uuid, :token_serial])
    |> validate_required([:username, :registered])
    |> field_validations()
  end

  def update_changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password])
    |> validate_required_change_exclusion([:uuid, :token_serial])
    |> validate_required_inclusion([:username, :email, :password])
    |> field_validations()
    |> hash_password()
  end

  def update_token_changeset(user, attrs) do
    user
    |> cast(attrs, [:token_serial])
    |> validate_required_change_exclusion([:username, :email, :password, :uuid])
  end

  defp field_validations(changeset) do
    changeset
    |> validate_length(:username, min: @min_username_len, max: @max_username_len)
    |> validate_length(:password, min: @min_password_len, max: @max_password_len)
    |> validate_language(:username)
    |> unique_constraint(:username, message: "is unavailable", name: :username_unavailable)
    |> unique_constraint(:unique_uuid_constraint, name: :unique_uuids)
    |> unique_constraint(:unique_email_constraint, name: :unique_emails)
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

  defp validate_required_inclusion(changeset, fields) do
    if Enum.any?(fields, &present_field?(changeset, &1)) do
      changeset
    else
      add_error(changeset, hd(fields), "One of these fields must be present: #{inspect(fields)}")
    end
  end

  defp validate_required_change_exclusion(changeset, fields) do
    if Enum.any?(fields, &present_change?(changeset, &1)) do
      add_error(
        changeset,
        hd(fields),
        "One of these change fields must not be present: #{inspect(fields)}"
      )
    else
      changeset
    end
  end

  defp present_field?(changeset, field) do
    value = get_field(changeset, field)
    value && value != ""
  end

  defp present_change?(changeset, field) do
    value = get_change(changeset, field)
    value && value != ""
  end
end
