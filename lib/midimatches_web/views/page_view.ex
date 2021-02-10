defmodule MidimatchesWeb.PageView do
  use MidimatchesWeb, :view

  alias Midimatches.Types.ClientRoomState

  def rooms_list do
    Midimatches.Matchmaking.get_rooms_list()
    |> Enum.map(fn %ClientRoomState{
                     room_id: room_id,
                     room_name: room_name
                   } ->
      link(room_name, to: "room/#{room_id}")
    end)
  end
end
