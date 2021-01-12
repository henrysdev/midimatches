defmodule Progressions.Rooms.Room.Game.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Progressions.Rooms.Room.GameServer

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{game_view: :round_end} = state) do
    # TODO branch on won game
    %GameServer{state | game_view: :round_start}
  end
end
