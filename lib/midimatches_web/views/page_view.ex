defmodule MidimatchesWeb.PageView do
  use MidimatchesWeb, :view

  alias Midimatches.{
    Rooms,
    Types.ClientRoomState
  }

  def rooms_list do
    Rooms.get_rooms_list()
    |> Enum.map(fn %ClientRoomState{
                     room_id: room_id,
                     room_name: room_name
                   } ->
      link(room_name, to: "room/#{room_id}")
    end)
  end
end
