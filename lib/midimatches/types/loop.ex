defmodule Midimatches.Types.Loop do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  alias Midimatches.Types.TimestepSlice

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:start_timestep, integer())
    field(:length, integer())
    field(:timestep_slices, list(%TimestepSlice{}))
  end
end
