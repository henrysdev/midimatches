defmodule Progressions.Rooms.Room.GameServer do
  @moduledoc """
  Process for maintaining game state for a game in a room
  """
  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Progressions.{
    Pids,
    Rooms.Room.Game.Bracket,
    Rooms.Room.GameLogic,
    Types.GameRules,
    Utils
  }

  require Logger

  @type id() :: String.t()
  # TODO add states for round_start and round_results
  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]

  typedstruct do
    field(:game_rules, %GameRules{}, default: %GameRules{})
    field(:musicians, %MapSet{}, enforce: true)
    field(:room_id, id(), enforce: true)

    field(:game_view, game_view(), default: :game_start)
    field(:bracket, %Bracket{}, default: %Bracket{})
    field(:contestants, list(id), default: [])
    field(:judges, list(id), default: [])
    field(:winner, id())
    field(:round_recording_start_time, integer(), default: 0)
    field(:ready_ups, %MapSet{}, default: MapSet.new())
    field(:recordings, %{required(id()) => any}, default: %{})
    field(:votes, %{required(id()) => id()}, default: %{})
  end

  def start_link(args) do
    GenServer.start_link(GameServer, args)
  end

  @impl true
  def init(args) do
    {room_id, musicians, game_rules} =
      case args do
        [{room_id, musicians, game_rules}] -> {room_id, musicians, game_rules}
        [{room_id, musicians}] -> {room_id, musicians, %GameRules{}}
      end

    Pids.register({:game_server, room_id}, self())

    {:ok, GameLogic.start_game(game_rules, musicians, room_id)}
  end

  # TODO split into API module [?]

  @spec get_current_view(pid()) :: atom()
  @doc """
  Get the current game view
  """
  def get_current_view(pid) do
    GenServer.call(pid, :current_view)
  end

  @spec advance_from_game_view(pid(), game_view()) :: :ok
  @doc """
  Advance to next game view by executing the default cleanup behavior of the current view and
  broadcasting the new view. Will only advance if game view to advance from is not stale.
  """
  def advance_from_game_view(pid, curr_view) do
    GenServer.call(pid, {:advance_from_game_view, curr_view})
  end

  @spec musician_ready_up(pid(), id()) :: :ok
  @doc """
  Ready up a musician in the game. All ready ups from active musicians required to progress
  state from game start to recording
  """
  def musician_ready_up(pid, musician_id) do
    GenServer.call(pid, {:incoming_event, {:ready_up, musician_id}})
  end

  @spec musician_recording(pid(), id(), any) :: :ok
  @doc """
  Collect a recording for a musician in the game. Recordings from all musicians required to progress
  state from recording to playback voting
  """
  def musician_recording(pid, musician_id, recording) do
    GenServer.call(pid, {:incoming_event, {:record, {musician_id, recording}}})
  end

  @spec musician_vote(pid(), id(), id()) :: :ok
  @doc """
  Collect a vote for a musician recording. Votes from all musicians required to progress
  state from recording to recording
  """
  def musician_vote(pid, musician_id, vote) do
    GenServer.call(pid, {:incoming_event, {:vote, {musician_id, vote}}})
  end

  @impl true
  def handle_call(:current_view, _from, %GameServer{game_view: game_view} = state) do
    {:reply, game_view, state}
  end

  @impl true
  def handle_call(
        {:advance_from_game_view, curr_view},
        _from,
        %GameServer{game_view: game_view} = state
      ) do
    # TODO instead of comparing state, maintain a game view iteration counter and check this
    # to prevent lapping issue
    if game_view == curr_view do
      %{sync_clients?: true, state: state} = GameLogic.advance_game_view(state)
      broadcast_gamestate(state)
      {:reply, :ok, state}
    else
      # stale advance message, do nothing
      Logger.warn(
        "stale advance_from_game_view message receieved. expected view: #{curr_view} actual view: #{
          game_view
        }"
      )

      {:reply, :error, state}
    end
  end

  @impl true
  def handle_call(
        {:incoming_event, {event_type, event_payload}},
        _from,
        %GameServer{
          game_view: curr_game_view
        } = state
      ) do
    %{sync_clients?: sync_clients?, state: state} =
      case {event_type, curr_game_view} do
        {:ready_up, :game_start} ->
          GameLogic.ready_up(state, event_payload)

        {:record, :recording} ->
          GameLogic.add_recording(state, event_payload)

        {:vote, :playback_voting} ->
          GameLogic.cast_vote(state, event_payload)

        _ ->
          %{sync_clients?: false, state: state}
      end

    if sync_clients? do
      broadcast_gamestate(state)
      {:reply, :synced, state}
    else
      {:reply, :ok, state}
    end
  end

  defp broadcast_gamestate(%GameServer{room_id: room_id, game_view: game_view} = state) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "view_update", %{
      view: game_view,
      game_state: Utils.new_server_to_client_game_state(state)
    })
  end
end
