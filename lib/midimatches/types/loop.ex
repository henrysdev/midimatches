defmodule Midimatches.Types.Loop do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  alias Midimatches.Types.TimestepSlice

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:timestep_slices, list(%TimestepSlice{}))
    field(:timestep_size, integer())
  end
end
