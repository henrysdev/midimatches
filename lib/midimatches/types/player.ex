defmodule Midimatches.Types.Player do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    field(:musician_id, String.t(), enforce: true)
    field(:player_alias, String.t(), enforce: true)
  end
end
