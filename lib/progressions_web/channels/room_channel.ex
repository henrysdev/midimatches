defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.Server,
    Types.Loop,
    Types.Musician,
    Types.Note,
    Types.TimestepSlice
  }

  # TODO move to type decode helper
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

  def join("room:" <> room_id, _params, socket) do
    if Rooms.room_exists?(room_id) do
      room_server = Pids.fetch!({:server, room_id})
      musician_id = Persistence.gen_serial_id()

      Server.add_musician(room_server, %Musician{
        musician_id: musician_id
      })

      {:ok,
       socket
       |> assign(room_server: room_server)
       |> assign(musician_id: musician_id)}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_in(
        "update_musician_loop",
        %{"loop" => loop_json},
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    {:ok, loop} = Poison.decode(loop_json, as: @loop_schema)

    Server.update_musician_loop(room_server, musician_id, loop)

    {:noreply, socket}
  end
end
