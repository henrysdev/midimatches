defmodule Midimatches.Rooms.Room.GenericGameServer do
  @moduledoc """
  GameServer common module. Fills in common functionality that all game server modules will
  need.
  """

  use TypedStruct

  alias Midimatches.{
    Rooms.Room.Modes.FreeForAllServer,
    Types.Player,
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

  # Optional Functions
  # TODO condense to client_event handler function

  @spec player_ready_up(pid(), id()) :: :ok
  @doc """
  Ready up a player in the game. All ready ups from active players required to progress
  state from game start to recording
  """
  def player_ready_up(pid, player_id) do
    GenServer.call(pid, {:client_event, {:ready_up, player_id}})
  end

  @spec player_recording(pid(), id(), any) :: :ok
  @doc """
  Collect a recording for a player in the game. Recordings from all players required to progress
  state from recording to playback voting
  """
  def player_recording(pid, player_id, recording) do
    GenServer.call(pid, {:client_event, {:record, {player_id, recording}}})
  end

  @spec player_vote(pid(), id(), id()) :: :ok
  @doc """
  Collect a vote for a player recording. Votes from all players required to progress
  state from recording to recording
  """
  def player_vote(pid, player_id, vote) do
    GenServer.call(pid, {:client_event, {:vote, {player_id, vote}}})
  end
end
