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
    case User.changeset(%User{}, user_params) |> Repo.insert() do
      {:error, changeset} -> {:error, traverse_errors(changeset)}
      model -> model
    end
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
