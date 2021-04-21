defmodule MidimatchesDb.Users do
  @moduledoc """
  DB boundary for User objects
  """

  alias MidimatchesDb.{
    Repo,
    User
  }

  @spec create_user(map()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Insert a new user
  """
  def create_user(%{} = user_params) when is_map(user_params) do
    user_changeset = User.changeset(%User{}, user_params)

    case Repo.insert(user_changeset) do
      {:error, changeset} -> {:error, traverse_errors(changeset)}
      model -> model
    end
  end

  @spec get_user_by_creds(map()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Returns the existing user from users table if credentials are valid
  """
  def get_user_by_creds(%{username: username, password: password}) do
    User
    |> Repo.get_by(username: username)
    |> Bcrypt.check_pass(password, hash_key: :password)
  end

  def get_user_by_creds(%{email: email, password: password}) do
    User
    |> Repo.get_by(email: email)
    |> Bcrypt.check_pass(password, hash_key: :password)
  end

  # TODO factor out to imported module
  defp traverse_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
