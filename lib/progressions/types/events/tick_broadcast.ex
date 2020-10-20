defmodule Progressions.Types.Events.TickBroadcast do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  alias Progressions.Types.TimestepSlice

  typedstruct do
    field(:timestep_slices, list(%TimestepSlice{}))
  end
end
