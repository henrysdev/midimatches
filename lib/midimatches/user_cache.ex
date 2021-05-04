defmodule Midimatches.UserCache do
  @moduledoc """
  API wrapper around the users db table for anonymous users
  """

  alias Midimatches.{
    Types.User,
    Utils
  }

  alias MidimatchesDb, as: Db

  require Logger

  @type id() :: String.t()
  @type db_response() :: {:ok, term()} | {:error, term()}

  @spec upsert_user(%User{}) :: db_response()
  @doc """
  Upserts a user in the user cache keyed by user_id
  """
  def upsert_user(%User{user_alias: user_alias, user_id: user_id}) do
    if !is_nil(user_id) and user_id_exists?(user_id) do
      case Db.Users.update_user(user_id, %{username: user_alias}) do
        {:ok, db_user} ->
          {:ok, Utils.db_user_to_user(db_user)}

        {:error, reason} ->
          Logger.error(reason)
          {:error, reason}
      end
    else
      case Db.Users.create_unregistered_user(%{username: user_alias}) do
        {:ok, db_user} ->
          {:ok, Utils.db_user_to_user(db_user)}

        {:error, reason} ->
          Logger.error(reason)
          {:error, reason}
      end
    end
  end

  @spec get_user_by_id(id()) :: db_response()
  @doc """
  Get the user value for the provided user_id
  """
  def get_user_by_id(user_id) do
    case Db.Users.get_user_by(:uuid, user_id) do
      {:ok, user} -> {:ok, user |> Utils.db_user_to_user()}
      other -> other
    end

    # case Db.Users.get_user_by(:uuid, user_id) do
    #   {:ok, db_user} -> Utils.db_user_to_user(db_user)
    #   _ -> nil
    # end
  end

  @spec delete_user_by_id(id()) :: db_response()
  @doc """
  Delete the user with the given user_id
  """
  def delete_user_by_id(user_id) do
    Db.Users.delete_user_by_id(user_id)

    # case Db.Users.delete_user_by_id(user_id) do
    #   {:ok, ^user_id} -> :ok
    #   _ -> nil
    # end
  end

  @spec user_id_exists?(id()) :: boolean()
  @doc """
  Returns truthy whether or not a user exists in the cache for a given user_id
  """
  def user_id_exists?(user_id) do
    case Db.Users.get_user_by(:uuid, user_id) do
      {:ok, %Db.User{}} -> true
      _ -> false
    end
  end

  @spec get_or_insert_user(%User{}) :: db_response()
  @doc """
  If a version of the given user already exists in the cache, returns it. Otherwise, insert the
  provided user and return it.
  """
  def get_or_insert_user(%User{user_id: user_id} = user) do
    if user_id_exists?(user_id) do
      get_user_by_id(user_id)
    else
      upsert_user(user)
    end
  end
end
