defmodule Midimatches.Types.TimestepSlice do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:timestep, integer())
    field(:notes, list(%Midimatches.Types.Note{}))
  end
end
