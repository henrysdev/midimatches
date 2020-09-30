defmodule Progressions.Types.Note do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  typedstruct enforce: true do
    field(:instrument, integer())
    field(:key, integer())
    field(:timestep, integer())
    field(:duration, integer())
  end
end
