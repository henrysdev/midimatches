defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.Musicians,
    Telemetry.EventLog
  }

  def join("room:" <> room_id, _params, socket) do
    if Rooms.room_exists?(room_id) do
      musician_id = Persistence.gen_serial_id()

      _new_musician =
        Pids.fetch({:musicians, room_id})
        |> Musicians.add_musician(musician_id, room_id)

      EventLog.log("user #{musician_id} joined room #{room_id}", room_id)
      {:ok, socket}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_in("play_note", %{"body" => _body}, %Phoenix.Socket{topic: topic} = socket) do
    [_, _room_id] = String.split(topic, ":")

    # TODO send note play event

    {:noreply, socket}
  end
end
