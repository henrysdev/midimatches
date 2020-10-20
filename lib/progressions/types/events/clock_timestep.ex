defmodule Progressions.Types.Events.ClockTimestep do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  typedstruct do
    field(:timestep, integer())
  end
end
