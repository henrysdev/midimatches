defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.GameServer,
    Rooms.RoomServer,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  @loop_schema %Loop{
    length: nil,
    start_timestep: nil,
    timestep_slices: [
      %TimestepSlice{
        notes: [
          %Note{
            duration: nil,
            instrument: nil,
            key: nil
          }
        ],
        timestep: nil
      }
    ]
  }

  # TODO look into splitting up room channel and game channel (or maybe different topics?)

  intercept ["start_game", "view_update"]

  def handle_out("view_update", msg, socket) do
    push(socket, "view_update", msg)
    {:noreply, socket}
  end

  def handle_out("start_game", msg, %Phoenix.Socket{assigns: %{room_id: room_id}} = socket) do
    push(socket, "start_game", msg)
    game_server = Pids.fetch!({:game_server, room_id})
    {:noreply, socket |> assign(game_server: game_server)}
  end

  def join("room:" <> room_id, _params, socket) do
    if Rooms.room_exists?(room_id) do
      {:ok,
       socket
       |> assign(room_id: room_id)}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  # TODO rename message to be clear it is room-level not game-level
  def handle_in(
        "musician_enter_room",
        _params,
        %Phoenix.Socket{assigns: %{room_id: room_id}} = socket
      ) do
    room_server = Pids.fetch!({:room_server, room_id})
    musician_id = Persistence.gen_serial_id()

    RoomServer.add_player(room_server, musician_id)

    {:reply, {:ok, %{musician_id: musician_id}},
     socket
     |> assign(room_server: room_server)
     |> assign(musician_id: musician_id)}
  end

  def handle_in(
        "musician_leave_room",
        _params,
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    RoomServer.drop_player(room_server, musician_id)

    {:noreply, socket}
  end

  def handle_in("musician_leave_room", _params, socket), do: {:noreply, socket}

  def handle_in(
        "musician_ready_up",
        _params,
        %Phoenix.Socket{assigns: %{game_server: game_server, musician_id: musician_id}} = socket
      ) do
    GameServer.musician_ready_up(game_server, musician_id)

    {:noreply, socket}
  end

  def handle_in(
        "musician_recording",
        %{"recording" => loop_json},
        %Phoenix.Socket{assigns: %{game_server: game_server, musician_id: musician_id}} = socket
      ) do
    {:ok, recording} = Poison.decode(loop_json, as: @loop_schema)

    GameServer.musician_recording(game_server, musician_id, recording)

    {:noreply, socket}
  end

  def handle_in(
        "musician_vote",
        %{"vote" => vote},
        %Phoenix.Socket{assigns: %{game_server: game_server, musician_id: musician_id}} = socket
      ) do
    GameServer.musician_vote(game_server, musician_id, vote)

    {:noreply, socket}
  end
end
