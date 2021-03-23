defmodule Midimatches.UserCache do
  use GenServer

  alias Midimatches.Types.User

  @type id() :: String.t()

  def init(arg) do
    if :ets.whereis(:user_cache) == :undefined do
      :ets.new(:user_cache, [
        :set,
        :public,
        :named_table,
        {:read_concurrency, true},
        {:write_concurrency, true}
      ])
    else
      :ok
    end

    {:ok, arg}
  end

  def start_link(arg) do
    GenServer.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @spec upsert_user(%User{}) :: %User{}
  @doc """
  Upserts a user in the user cache keyed by user_id
  """
  def upsert_user(%User{user_id: user_id} = user) do
    :ets.insert(:user_cache, {user_id, user})
    user
  end

  @spec get_user_by_id(id()) :: %User{} | nil
  @doc """
  Get the user value for the provided user_id
  """
  def get_user_by_id(user_id) do
    case :ets.lookup(:user_cache, user_id) do
      [] -> nil
      [{found_user_id, user}] when found_user_id == user_id -> user
    end
  end

  @spec delete_user_by_id(id()) :: boolean()
  @doc """
  Delete the user with the given user_id
  """
  def delete_user_by_id(user_id) do
    :ets.delete(:user_cache, user_id)
  end

  @spec user_id_exists?(id()) :: boolean()
  @doc """
  Returns truthy whether or not a user exists in the cache for a given user_id
  """
  def user_id_exists?(user_id) do
    :ets.member(:user_cache, user_id)
  end

  @spec get_or_insert_user(%User{}) :: %User{}
  @doc """
  If a version of the given user already exists in the cache, returns it. Otherwise, insert the
  provided user and return it.
  """
  def get_or_insert_user(%User{user_id: user_id} = user) do
    if user_id_exists?(user_id) do
      get_user_by_id(user_id)
    else
      upsert_user(user)
      user
    end
  end
end
