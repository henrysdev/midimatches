defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.GameServerAPI,
    Types.Loop,
    Types.Musician,
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

  intercept ["view_update"]

  def handle_out("view_update", msg, socket) do
    push(socket, "view_update", msg)

    IO.inspect({:VIEW_UPDATE})
    {:noreply, socket}
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

  def handle_in(
        "musician_enter_room",
        _params,
        %Phoenix.Socket{assigns: %{room_id: room_id}} = socket
      ) do
    room_server = Pids.fetch!({:game_server, room_id})
    musician_id = Persistence.gen_serial_id()

    GameServerAPI.add_musician(room_server, %Musician{
      musician_id: musician_id
    })

    {:noreply,
     socket
     |> assign(room_server: room_server)
     |> assign(musician_id: musician_id)}
  end

  def handle_in(
        "musician_leave_room",
        _params,
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    GameServerAPI.drop_musician(room_server, musician_id)

    {:noreply, socket}
  end

  def handle_in("musician_leave_room", _params, socket), do: {:noreply, socket}

  def handle_in(
        "musician_ready_up",
        _params,
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    GameServerAPI.musician_ready_up(room_server, musician_id)

    {:noreply, socket}
  end

  def handle_in(
        "musician_recording",
        %{"recording" => loop_json},
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    {:ok, recording} = Poison.decode(loop_json, as: @loop_schema)

    GameServerAPI.musician_recording(room_server, musician_id, recording)

    {:noreply, socket}
  end

  def handle_in(
        "musician_vote",
        %{"vote" => vote},
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    GameServerAPI.musician_vote(room_server, musician_id, vote)

    {:noreply, socket}
  end
end
