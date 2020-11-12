defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.LoopServer,
    Types.Musician
  }

  def join("room:" <> room_id, _params, socket) do
    if Rooms.room_exists?(room_id) do
      loop_server = Pids.fetch!({:loop_server, room_id})

      LoopServer.add_musician(loop_server, %Musician{
        musician_id: Persistence.gen_serial_id()
      })

      {:ok, socket}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_in("new_loop", %{"body" => _body}, %Phoenix.Socket{topic: topic} = socket) do
    [_, _room_id] = String.split(topic, ":")

    # TODO send note play event

    {:noreply, socket}
  end
end
