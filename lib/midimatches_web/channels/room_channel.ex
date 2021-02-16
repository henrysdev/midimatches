defmodule MidimatchesWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use MidimatchesWeb, :channel

  alias Midimatches.{
    Pids,
    Rooms,
    Rooms.Room.GameServer,
    Rooms.RoomServer,
    Types.Loop,
    Types.Note,
    Types.Player,
    Types.TimestepSlice
  }

  require Logger

  @loop_schema %Loop{
    length: nil,
    start_timestep: nil,
    timestep_slices: [
      %TimestepSlice{
        notes: [
          %Note{
            duration: nil,
            key: nil,
            velocity: nil
          }
        ],
        timestep: nil
      }
    ]
  }

  intercept ["lobby_update", "start_game", "game_update", "reset_room"]

  #################################################################################################
  ## Join Messages                                                                               ##
  #################################################################################################

  def join(
        "room:" <> room_id,
        %{"player_id" => player_id},
        socket
      ) do
    if Rooms.room_exists?(room_id) do
      send(self(), {:init_conn, room_id})
      room_server = Pids.fetch!({:room_server, room_id})

      {:ok,
       socket
       |> assign(room_id: room_id)
       |> assign(room_server: room_server)
       |> assign(player_id: player_id)}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_info({:init_conn, room_id}, socket) do
    Pids.fetch!({:room_server, room_id})
    |> RoomServer.sync_lobby_state()

    PresenceTracker.track_conn(self(), "room: " <> room_id)

    {:noreply, socket}
  end

  #################################################################################################
  ## Incoming Messages                                                                           ##
  #################################################################################################

  def handle_in(
        "player_pregame_join",
        %{"player_alias" => player_alias, "player_id" => player_id},
        %Phoenix.Socket{assigns: %{room_id: room_id, player_id: player_id}} = socket
      ) do
    room_server = Pids.fetch!({:room_server, room_id})

    player = %Player{
      player_id: player_id,
      player_alias: player_alias
    }

    RoomServer.add_player(room_server, player)

    {:reply, {:ok, %{player: player}},
     socket
     |> assign(room_server: room_server)
     |> assign(player_id: player_id)}
  end

  def handle_in(
        "player_leave_room",
        _params,
        %Phoenix.Socket{assigns: %{room_server: room_server, player_id: player_id}} = socket
      ) do
    RoomServer.drop_player(room_server, player_id)

    {:noreply, socket}
  end

  def handle_in(
        "player_ready_up",
        _params,
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    GameServer.player_ready_up(game_server, player_id)

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(
        "player_recording",
        %{"recording" => loop_json},
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    {:ok, recording} = Poison.decode(loop_json, as: @loop_schema)

    GameServer.player_recording(game_server, player_id, recording)

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(
        "player_vote",
        %{"vote" => vote},
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    GameServer.player_vote(game_server, player_id, vote)

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(event, params, socket) do
    Logger.warn(
      "Unexpected websocket event. " <>
        "type=#{event} " <>
        "params=#{inspect(params)} " <>
        "socket.assigns=#{inspect(socket.assigns)} "
    )

    {:noreply, socket}
  end

  #################################################################################################
  ## Outgoing Messages                                                                           ##
  #################################################################################################

  def handle_out("lobby_update", msg, socket) do
    push(socket, "lobby_update", msg)
    {:noreply, socket}
  end

  def handle_out("game_update", msg, socket) do
    push(socket, "game_update", msg)
    {:noreply, socket}
  end

  def handle_out("start_game", msg, %Phoenix.Socket{assigns: %{room_id: room_id}} = socket) do
    push(socket, "start_game", msg)
    game_server = Pids.fetch!({:game_server, room_id})
    {:noreply, socket |> assign(game_server: game_server)}
  end

  def handle_out("reset_room", msg, %Phoenix.Socket{} = socket) do
    push(socket, "reset_room", msg)
    {:noreply, socket}
  end
end
