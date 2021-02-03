defmodule Progressions.Rooms.Room.Game.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Progressions.{
    Pids,
    Rooms.Room.GameServer,
    Rooms.RoomServer
  }

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{room_id: room_id, game_view: :game_end} = state) do
    # tell room server to reset
    {:room_server, room_id}
    |> Pids.fetch!()
    |> RoomServer.reset_room()

    state
  end
end
