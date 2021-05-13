defmodule Midimatches.Rooms.Room.Modes.FreeForAll.FreeForAllServer do
  @moduledoc """
  Process for maintaining game state for a game in a room
  """
  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.FreeForAllLogic,
    Rooms.RoomServer,
    Types.GameRules,
    Types.Player,
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
          state: %GameInstance{}
        }

  def start_link(args) do
    GenServer.start_link(FreeForAllServer, args)
  end

  @impl true
  def init(args) do
    {room_id, game_id, players, audience_members, game_rules} =
      case args do
        [{room_id, game_id, players, audience_members, game_rules}] ->
          {room_id, game_id, players, audience_members, game_rules}

        [{room_id, game_id, players, audience_members}] ->
          {room_id, game_id, players, audience_members, %GameRules{}}
      end

    Pids.register({:game_server, room_id}, self())

    game_state =
      FreeForAllLogic.start_game(game_rules, players, audience_members, room_id, game_id)
      |> broadcast_start_game()
      |> schedule_view_timeout()

    {:ok, game_state}
  end

  @impl true
  def handle_cast({:drop_player, player_id}, %GameInstance{} = state) do
    instruction = FreeForAllLogic.remove_player(state, player_id)

    {:noreply, exec_instruction(instruction)}
  end

  @impl true
  def handle_cast({:drop_audience_member, player_id}, %GameInstance{} = state) do
    instruction = FreeForAllLogic.remove_audience_member(state, player_id)

    {:noreply, exec_instruction(instruction)}
  end

  @impl true
  def handle_call({:add_player, %Player{} = player}, _from, %GameInstance{} = state) do
    instruction = FreeForAllLogic.add_player(state, player)

    {:reply, :ok, exec_instruction(instruction)}
  end

  @impl true
  def handle_call(
        {:add_audience_member, %Player{} = audience_member},
        _from,
        %GameInstance{} = state
      ) do
    instruction = FreeForAllLogic.add_audience_member(state, audience_member)

    {:reply, :ok, exec_instruction(instruction)}
  end

  @impl true
  def handle_call(:current_view, _from, %GameInstance{game_view: game_view} = state) do
    {:reply, game_view, state}
  end

  @impl true
  def handle_call(
        {:advance_from_game_view, curr_view, curr_view_counter},
        _from,
        %GameInstance{game_view: game_view, view_counter: view_counter} = state
      ) do
    if game_view == curr_view and view_counter == curr_view_counter do
      state =
        state
        |> FreeForAllLogic.advance_game_view()
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
        %GameInstance{
          game_view: curr_game_view
        } = state
      ) do
    instruction =
      case {event_type, curr_game_view} do
        {:ready_up, :game_start} ->
          FreeForAllLogic.ready_up(state, event_payload)

        {:record, :recording} ->
          FreeForAllLogic.add_recording(state, event_payload)

        {:vote, :playback_voting} ->
          FreeForAllLogic.cast_vote(state, event_payload)

        _ ->
          Logger.warn(
            "Unexpected client_event, " <>
              "event_type=#{inspect(event_type)}, " <>
              "event_payload=#{inspect(event_payload)}"
          )

          %{sync_clients?: false, view_change?: false, state: state}
      end

    {:reply, :ok, exec_instruction(instruction)}
  end

  @spec exec_instruction(instruction_map()) :: %GameInstance{}
  defp exec_instruction(%{sync_clients?: sync_clients?, view_change?: view_change?, state: state}) do
    check_game_empty(state)

    state =
      if view_change? do
        update_view_deadline(state)
      else
        state
      end

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

  @spec update_view_deadline(%GameInstance{}) :: %GameInstance{}
  defp update_view_deadline(
         %GameInstance{
           game_view: game_view,
           game_rules: %{view_timeouts: view_timeouts}
         } = state
       ) do
    view_deadline =
      if Map.has_key?(view_timeouts, game_view) do
        view_timeouts
        |> Map.get(game_view)
        |> Utils.calc_future_timestamp()
      else
        -1
      end

    %GameInstance{state | view_deadline: view_deadline}
  end

  @spec schedule_view_timeout(%GameInstance{}) :: %GameInstance{}
  defp schedule_view_timeout(
         %GameInstance{
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

  @spec check_game_empty(%GameInstance{}) :: %GameInstance{} | :ok
  @doc """
  Check that there are still enough players in game to continue the game. If there is not,
  then reset the room back to pregame lobby.
  """
  def check_game_empty(
        %GameInstance{players: players, game_rules: %GameRules{min_players: min_players}} = state
      ) do
    # end game if not enough players left to play
    if MapSet.size(players) < min_players do
      FreeForAllLogic.end_game(state, :game_canceled)
    else
      state
    end
  end

  @spec broadcast_start_game(%GameInstance{}) :: %GameInstance{}
  defp broadcast_start_game(%GameInstance{room_id: room_id} = state) do
    MidimatchesWeb.Endpoint.broadcast("room:#{room_id}", "start_game", %{
      game_state: Utils.server_to_client_game_state(state)
    })

    state
  end

  @spec broadcast_gamestate(%GameInstance{}) :: %GameInstance{}
  defp broadcast_gamestate(%GameInstance{room_id: room_id} = state) do
    MidimatchesWeb.Endpoint.broadcast("room:#{room_id}", "game_update", %{
      game_state: Utils.server_to_client_game_state(state)
    })

    state
  end

  @spec increment_view_counter(%GameInstance{}) :: %GameInstance{}
  defp increment_view_counter(%GameInstance{view_counter: view_counter} = state),
    do: %GameInstance{state | view_counter: view_counter + 1}

  @spec back_to_room_lobby(%GameInstance{}) :: :ok
  def back_to_room_lobby(%GameInstance{room_id: room_id}) do
    room_server = Pids.fetch!({:room_server, room_id})
    RoomServer.reset_room(room_server)
  end
end
