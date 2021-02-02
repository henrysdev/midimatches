defmodule Progressions.Rooms.Room.GameServer do
  @moduledoc """
  Process for maintaining game state for a game in a room
  """
  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Progressions.{
    Pids,
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameLogic,
    Types.GameRules,
    Utils
  }

  require Logger

  @type id() :: String.t()
  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  typedstruct do
    field(:game_rules, %GameRules{}, default: %GameRules{})
    field(:musicians, MapSet.t(id()), enforce: true)
    field(:players, MapSet.t(Player), enforce: true)
    field(:room_id, id(), enforce: true)

    field(:game_view, game_view(), default: :game_start)
    field(:contestants, list(id), default: [])
    field(:winner, id(), default: nil)
    field(:round_recording_start_time, integer(), default: 0)
    field(:ready_ups, %MapSet{}, default: MapSet.new())
    field(:recordings, %{required(id()) => any}, default: %{})
    field(:votes, %{required(id()) => id()}, default: %{})
    field(:view_counter, integer(), default: 0)
    field(:round_num, integer(), default: 1)
    field(:scores, %{required(id()) => integer()}, default: %{})
  end

  def start_link(args) do
    GenServer.start_link(GameServer, args)
  end

  @impl true
  def init(args) do
    {room_id, players, game_rules} =
      case args do
        [{room_id, players, game_rules}] -> {room_id, players, game_rules}
        [{room_id, players}] -> {room_id, players, %GameRules{}}
      end

    Pids.register({:game_server, room_id}, self())

    game_state =
      GameLogic.start_game(game_rules, players, room_id)
      |> broadcast_start_game()
      |> schedule_view_timeout()

    {:ok, game_state}
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

  @spec musician_ready_up(pid(), id()) :: :ok
  @doc """
  Ready up a musician in the game. All ready ups from active musicians required to progress
  state from game start to recording
  """
  def musician_ready_up(pid, musician_id) do
    GenServer.call(pid, {:client_event, {:ready_up, musician_id}})
  end

  @spec musician_recording(pid(), id(), any) :: :ok
  @doc """
  Collect a recording for a musician in the game. Recordings from all musicians required to progress
  state from recording to playback voting
  """
  def musician_recording(pid, musician_id, recording) do
    GenServer.call(pid, {:client_event, {:record, {musician_id, recording}}})
  end

  @spec musician_vote(pid(), id(), id()) :: :ok
  @doc """
  Collect a vote for a musician recording. Votes from all musicians required to progress
  state from recording to recording
  """
  def musician_vote(pid, musician_id, vote) do
    GenServer.call(pid, {:client_event, {:vote, {musician_id, vote}}})
  end

  @impl true
  def handle_call(:current_view, _from, %GameServer{game_view: game_view} = state) do
    {:reply, game_view, state}
  end

  @impl true
  def handle_call(
        {:advance_from_game_view, curr_view, curr_view_counter},
        _from,
        %GameServer{game_view: game_view, view_counter: view_counter} = state
      ) do
    if game_view == curr_view and view_counter == curr_view_counter do
      state =
        state
        |> GameLogic.advance_game_view()
        |> exec_instruction()

      {:reply, :ok, state}
    else
      # stale advance message, do nothing
      Logger.info(
        "stale advance_from_game_view message receieved. " <>
          "expected view: #{curr_view} actual view: #{game_view}, " <>
          "expected view_counter: #{curr_view_counter} actual view_counter: #{view_counter}"
      )

      {:reply, :error, state}
    end
  end

  @impl true
  def handle_call(
        {:client_event, {event_type, event_payload}},
        _from,
        %GameServer{
          game_view: curr_game_view
        } = state
      ) do
    instruction =
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

    {:reply, :ok, exec_instruction(instruction)}
  end

  @spec exec_instruction(instruction_map()) :: %GameServer{}
  defp exec_instruction(%{sync_clients?: sync_clients?, view_change?: view_change?, state: state}) do
    state =
      if sync_clients? do
        broadcast_gamestate(state)
      else
        state
      end

    state =
      if view_change? do
        state
        |> increment_view_counter()
        |> schedule_view_timeout()
      else
        state
      end

    state
  end

  @spec schedule_view_timeout(%GameServer{}) :: %GameServer{}
  defp schedule_view_timeout(
         %GameServer{
           room_id: room_id,
           game_view: game_view,
           view_counter: view_counter,
           game_rules: %{view_timeouts: view_timeouts}
         } = state
       ) do
    if is_nil(Map.get(view_timeouts, game_view)) do
      state
    else
      view_timer = Pids.fetch({:view_timer, room_id})
      timeout_duration = Map.get(view_timeouts, game_view)

      ViewTimer.schedule_view_timeout(
        view_timer,
        game_view,
        view_counter,
        timeout_duration,
        self()
      )

      state
    end
  end

  @spec broadcast_start_game(%GameServer{}) :: %GameServer{}
  defp broadcast_start_game(%GameServer{room_id: room_id} = state) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "start_game", %{
      game_state: Utils.new_server_to_client_game_state(state)
    })

    state
  end

  @spec broadcast_gamestate(%GameServer{}) :: %GameServer{}
  defp broadcast_gamestate(%GameServer{room_id: room_id} = state) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "view_update", %{
      game_state: Utils.new_server_to_client_game_state(state)
    })

    state
  end

  @spec increment_view_counter(%GameServer{}) :: %GameServer{}
  defp increment_view_counter(%GameServer{view_counter: view_counter} = state),
    do: %GameServer{state | view_counter: view_counter + 1}
end
