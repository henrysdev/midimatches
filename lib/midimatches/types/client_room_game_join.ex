defmodule Midimatches.Types.ClientRoomGameJoin do
  @moduledoc false

  use TypedStruct

  alias Midimatches.Types.{
    ClientGameState,
    ClientRoomState
  }

  @derive Jason.Encoder
  typedstruct do
    field(:room_state, %ClientRoomState{}, enforce: true)
    field(:game_state, %ClientGameState{}, default: %ClientGameState{})
  end
end
