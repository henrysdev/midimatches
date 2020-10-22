defmodule Progressions.Types.Configs.MusicianConfig do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  alias Progressions.Types.Loop

  typedstruct do
    field(:loop, %Loop{},
      default: %Loop{
        start_timestep: 0,
        length: 4,
        timestep_slices: []
      }
    )
  end
end
