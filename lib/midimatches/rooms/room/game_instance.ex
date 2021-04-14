defmodule Midimatches.Rooms.Room.GameInstance do
  @moduledoc """
  A common top-level API and state specification for game mode implementations.
  """

  use TypedStruct

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Rooms.Room.Modes.FreeForAll.FreeForAllServer,
    Rooms.RoomServer,
    Types.GameRules,
    Types.Player,
    Types.WinResult
  }

  @type id() :: String.t()
  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]

  typedstruct do
    # enforced (must be provided explicitly)
    field(:player_ids_set, MapSet.t(id()), enforce: true)
    field(:players, MapSet.t(Player), enforce: true)
    field(:room_id, id(), enforce: true)
    field(:game_id, id(), enforce: true)
    field(:sample_beats, list(String.t()), enforce: true)

    field(:game_rules, %GameRules{}, default: %GameRules{})
    field(:game_view, game_view(), default: :game_start)
    field(:contestants, list(id), default: [])
    field(:game_winners, %WinResult{}, default: nil)
    field(:round_recording_start_time, integer(), default: 0)
    field(:ready_ups, %MapSet{}, default: MapSet.new())
    field(:recordings, %{required(id()) => any}, default: %{})
    field(:votes, %{required(id()) => id()}, default: %{})
    field(:view_counter, integer(), default: 0)
    field(:round_num, integer(), default: 1)
    field(:round_winners, %WinResult{}, default: nil)
    field(:scores, %{required(id()) => integer()}, default: %{})
    field(:view_deadline, integer(), default: -1)
    field(:audience_members, MapSet.t(Player), default: MapSet.new())
    field(:audience_member_ids_set, MapSet.t(id()), default: MapSet.new())
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :worker,
      restart: :permanent,
      shutdown: 500
    }
  end

  def start_link(args, module \\ FreeForAllServer) do
    module.start_link(args)
  end

  @spec get_current_view(pid()) :: atom()
  @doc """
  Get the current game view
  """
  def get_current_view(pid) do
    GenServer.call(pid, :current_view)
  end

  @spec advance_from_game_view(pid(), game_view(), integer()) :: :ok
  @doc """
  Advance to next game view by executing the default cleanup behavior of the current view and
  broadcasting the new view. Will only advance if game view to advance from is not stale.
  """
  def advance_from_game_view(pid, curr_view, view_counter) do
    GenServer.call(pid, {:advance_from_game_view, curr_view, view_counter})
  end

  @spec add_player(pid(), %Player{}) :: :ok
  @doc """
  Add a new player to the game.
  """
  def add_player(pid, %Player{} = player) do
    GenServer.call(pid, {:add_player, player})
  end

  @spec drop_player(pid(), id()) :: :ok
  @doc """
  Remove a player from the game.
  """
  def drop_player(pid, player_id) do
    GenServer.cast(pid, {:drop_player, player_id})
  end

  @spec add_audience_member(pid(), %Player{}) :: :ok
  @doc """
  Add a new audience member to the game.
  """
  def add_audience_member(pid, %Player{} = player) do
    GenServer.call(pid, {:add_audience_member, player})
  end

  @spec drop_audience_member(pid(), id()) :: :ok
  @doc """
  Remove an audience member from the game.
  """
  def drop_audience_member(pid, player_id) do
    GenServer.cast(pid, {:drop_audience_member, player_id})
  end

  @spec client_event(pid(), tuple()) :: :ok
  @doc """
  Catchall endpoint for accepting game-mode specific client events to be processed.
  """
  def client_event(pid, event) do
    GenServer.call(pid, {:client_event, event})
  end

  @spec back_to_room_lobby(%GameInstance{}) :: :ok
  @doc """
  Reset room at end of game
  """
  def back_to_room_lobby(%GameInstance{room_id: room_id}) do
    room_server = Pids.fetch!({:room_server, room_id})
    RoomServer.reset_room(room_server)
  end
end
