defmodule Midimatches.Types.Note do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:key, integer())
    field(:duration, integer())
    field(:velocity, float())
  end
end
