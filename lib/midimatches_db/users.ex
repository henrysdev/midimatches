defmodule MidimatchesDb.Users do
  @moduledoc """
  DB boundary for User objects
  """

  alias MidimatchesDb.{
    Repo,
    User
  }

  import Ecto.Query

  @type id() :: String.t()

  @spec create_user(map()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Insert a new user
  """
  def create_user(%{} = user_params) when is_map(user_params) do
    user_params =
      user_params
      |> map_to_string_keys()
      |> Map.put("registered", true)

    user_changeset = User.changeset(%User{}, user_params)

    case Repo.insert(user_changeset) do
      {:error, changeset} -> {:error, traverse_errors(changeset)}
      {:ok, record} -> {:ok, record}
    end
  end

  @spec create_unregistered_user(map()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Insert a new unregistered user
  """
  def create_unregistered_user(%{} = user_params) when is_map(user_params) do
    user_params =
      user_params
      |> map_to_string_keys()
      |> Map.put("registered", false)

    user_changeset = User.unregistered_changeset(%User{}, user_params)

    case Repo.insert(user_changeset) do
      {:error, changeset} -> {:error, traverse_errors(changeset)}
      {:ok, record} -> {:ok, record}
    end
  end

  @spec update_user(id(), map()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Update an existing user
  """
  def update_user(user_id, %{} = user_params) when is_map(user_params) do
    user_params =
      user_params
      |> map_to_string_keys()
      |> Map.delete("registered")

    with {:ok, found_user} <- get_user_by(:uuid, user_id),
         {change, user_params} <- build_update_changeset(found_user, user_params),
         changeset <- User.update_changeset(change, user_params),
         {:ok, updated_model} <- Repo.update(changeset) do
      {:ok, updated_model}
    else
      {:error, %Ecto.Changeset{} = reason} ->
        {:error, traverse_errors(reason)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec delete_user_by_id(id()) :: {:ok, id()} | {:error, any()}
  @doc """
  Delete an existing user
  """
  def delete_user_by_id(user_id) do
    with {:ok, %User{uuid: uuid} = found_user} <- get_user_by(:uuid, user_id),
         {1, nil} <- Repo.delete_all(from(user in User, where: user.uuid == ^uuid)) do
      {:ok, uuid}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec user_increment_session(id()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Incremenet a user's token session
  """
  def user_increment_session(user_id) do
    with {:ok, found_user} <- get_user_by(:uuid, user_id),
         {change, user_params} <-
           build_update_changeset(found_user, %{"token_serial" => found_user.token_serial + 1}, [
             "token_serial"
           ]),
         changeset <- User.update_token_changeset(change, user_params),
         {:ok, %User{token_serial: token_serial}} <- Repo.update(changeset) do
      {:ok, token_serial}
    else
      {:error, %Ecto.Changeset{} = reason} ->
        {:error, traverse_errors(reason)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp build_update_changeset(
         found_user,
         raw_user_params,
         accepted_keys \\ ["username", "email", "password", "uuid"]
       ) do
    user_params =
      for {key, val} <- raw_user_params, into: %{} do
        if key in accepted_keys do
          {String.to_atom(key), val}
        else
          {key, val}
        end
      end

    change =
      found_user
      |> Ecto.Changeset.change(user_params)

    {change, user_params}
  end

  @spec map_to_string_keys(map()) :: map()
  defp map_to_string_keys(atoms_map) when is_map(atoms_map) do
    for {key, val} <- atoms_map, into: %{} do
      {to_string(key), to_string(val)}
    end
  end

  @spec get_user_by(any(), any()) :: {:ok, %User{}} | {:error, any()}
  @doc """
  Get user by specified field
  """
  def get_user_by(field, val) when field in [:uuid, :email, :username] do
    User
    |> Repo.get_by([{field, val}])
    |> treat_nil_as_error("user")
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

  defp treat_nil_as_error(result, name) when is_nil(result),
    do: {:error, %{not_found: name}}

  defp treat_nil_as_error(result, _name), do: {:ok, result}
end
