defmodule Progressions.Types.Musician do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  alias Progressions.Types.Loop

  typedstruct do
    field(:musician_id, String.t(), enforce: true)
    field(:view_state, nil)

    # deprecated. recordings will be in view_state
    field(:loop, %Loop{},
      default: %Loop{
        start_timestep: 0,
        length: 4,
        timestep_slices: []
      }
    )
  end
end
