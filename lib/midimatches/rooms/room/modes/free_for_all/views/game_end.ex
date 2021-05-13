defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Midimatches.Rooms.Room.{
    GameInstance,
    Modes.FreeForAll.FreeForAllLogic
  }

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(%GameInstance{game_view: :game_end} = state) do
    FreeForAllLogic.end_game(state, :game_completed)
    state
  end
end
