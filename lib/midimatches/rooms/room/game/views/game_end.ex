defmodule Midimatches.Rooms.Room.Game.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Midimatches.{
    Rooms.Room.GameServer
  }

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{game_view: :game_end} = state) do
    # tell room server to reset
    GameServer.back_to_room_lobby(state)
    state
  end
end
