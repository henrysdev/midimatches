defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.Musicians
  }

  def join("room:" <> room_id, _params, socket) do
    if Progressions.Rooms.room_exists?(room_id) do
      # TODO musician id handling / generation
      musician_id = DateTime.utc_now() |> DateTime.to_string()

      _new_musician =
        Pids.fetch({:musicians, room_id})
        |> Musicians.add_musician(musician_id, room_id)

      Logger.info("user #{musician_id} joined room #{room_id}")
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
