defmodule Progressions.Types.Timestep do
  @moduledoc false
  # TODO detailed module doc on this type

  use TypedStruct

  typedstruct enforce: true do
    field(:step, integer())
    field(:notes, list(%Progressions.Types.Note{}))
  end
end
