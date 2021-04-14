defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Midimatches.Rooms.Room.GameInstance

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(%GameInstance{game_view: :game_end} = state) do
    # tell room server to reset
    GameInstance.back_to_room_lobby(state)
    state
  end
end
