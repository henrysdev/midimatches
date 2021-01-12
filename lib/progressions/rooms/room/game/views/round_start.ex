defmodule Progressions.Rooms.Room.Game.Views.RoundStart do
  @moduledoc """
  Game logic specific to the round_start game view
  """

  alias Progressions.Rooms.Room.GameServer

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{game_view: :round_start} = state) do
    %GameServer{
      state
      | game_view: :recording,
        round_recording_start_time: :os.system_time(:microsecond)
    }
  end
end
