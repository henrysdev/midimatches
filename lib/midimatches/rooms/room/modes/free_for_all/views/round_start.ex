defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.RoundStart do
  @moduledoc """
  Game logic specific to the round_start game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Utils
  }

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(%GameInstance{game_view: :round_start} = state) do
    %GameInstance{
      state
      | game_view: :recording,
        round_recording_start_time: Utils.curr_utc_timestamp()
    }
  end
end
