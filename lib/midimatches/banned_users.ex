defmodule Midimatches.BannedUsers do
  @moduledoc """
  Banned users set implemented as a GenServer wraping an ETS table.
  """
  use GenServer

  # 1 hour
  @default_ban_time 1000 * 60 * 60

  @type t :: %{ban_lift_timers: %{}}
  @type cache_key :: any
  @type cache_value :: any
  @type id() :: String.t()

  def start_link(_args) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_args) do
    generate_table()
    {:ok, %{ban_lift_timers: %{}}}
  end

  @spec add_banned_user(id(), integer()) :: :ok
  @doc """
  Add a user to the set of banned users
  """
  def add_banned_user(user_id, ban_time \\ @default_ban_time) do
    GenServer.cast(__MODULE__, {:add_banned_user, user_id, ban_time})
  end

  @spec remove_banned_user(id()) :: :ok
  @doc """
  Remove a banned user from the set of banned users
  """
  def remove_banned_user(user_id) do
    Process.send(self(), {:remove_ban, user_id}, [])
  end

  @spec wipe_banned_users() :: :ok
  @doc """
  Asynchronous wipe_banned_userss all values in the cache.
  """
  def wipe_banned_users do
    GenServer.call(__MODULE__, :wipe_banned_users)
  end

  @spec banned?(id()) :: any | nil
  @doc """
  Returns truthy for whether or not the given user_id is banned
  """
  def banned?(user_id) when is_binary(user_id) do
    case :ets.lookup(:banned_users, user_id) do
      [{^user_id, _value} | _rest] -> true
      [] -> false
    end
  end

  @spec list_banned_users() :: list(id)
  @doc """
  Returns a list of all banned users
  """
  def list_banned_users do
    GenServer.call(__MODULE__, {:list_banned_users})
  end

  # Callbacks

  @spec handle_cast({:add_banned_user, id(), integer()}, t) :: {:noreply, t}
  def handle_cast(
        {:add_banned_user, user_id, ban_time},
        state = %{ban_lift_timers: ban_lift_timers}
      ) do
    # since we're updating the value, let's kill off the last ban_lift_timer.
    case Map.get(ban_lift_timers, user_id) do
      nil -> nil
      ban_lift_timer -> Process.cancel_timer(ban_lift_timer)
    end

    # insert the user_id into the banned set
    :ets.insert(:banned_users, {user_id})

    # generate a new ban_lift_timer
    ban_lift_timer = Process.send_after(self(), {:remove_ban, user_id}, ban_time)

    {:noreply, %{state | ban_lift_timers: Map.put(ban_lift_timers, user_id, ban_lift_timer)}}
  end

  @spec handle_info({:remove_ban, id()}, t) :: {:noreply, t}
  def handle_info({:remove_ban, user_id}, state) do
    :ets.delete(:banned_users, user_id)
    {:noreply, state}
  end

  @spec handle_call({:list_banned_users}, any, t) :: {:reply, list(id), t}
  def handle_call({:list_banned_users}, _sender, state) do
    banned_users =
      case :ets.match(:banned_users, {:"$1"}) do
        [] -> []
        banned_user_matches -> Enum.flat_map(banned_user_matches, & &1)
      end

    {:reply, banned_users, state}
  end

  @spec handle_call(:wipe_banned_users, any, t) :: {:reply, :ok, t}
  def handle_call(:wipe_banned_users, _sender, state = %{ban_lift_timers: ban_lift_timers}) do
    ban_lift_timers
    |> Map.values()
    |> Enum.each(&Process.cancel_timer/1)

    :ets.delete(:banned_users)
    generate_table()
    {:reply, :ok, %{state | ban_lift_timers: %{}}}
  end

  defp generate_table do
    :ets.new(:banned_users, [
      :set,
      :public,
      :named_table,
      {:read_concurrency, true},
      {:write_concurrency, true}
    ])
  end
end
