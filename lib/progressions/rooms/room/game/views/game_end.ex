defmodule Progressions.Rooms.Room.Game.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Progressions.Rooms.Room.GameServer

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{game_view: :game_start} = state) do
    %GameServer{state | game_view: :game_start}
  end
end
