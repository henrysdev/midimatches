defmodule ProgressionsWeb.RoomChannel do
  use Phoenix.Channel
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room
  }

  def join("room:" <> room_id, _params, socket) do
    if Progressions.Rooms.room_exists?(room_id) do
      Logger.info("user joined room #{room_id}")
      {:ok, socket}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_in("play_note", %{"body" => body}, %Phoenix.Socket{topic: topic} = socket) do
    [_, room_id] = String.split(topic, ":")

    room = Pids.get_room(room_id)
    # Room.Server.send_play_event() # (should this be routed directly to instrument?)
    # TODO send note play event

    {:noreply, socket}
  end
end
