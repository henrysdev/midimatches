defmodule Progressions.Types.Configs.MusicianConfig do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  alias Progressions.Types.{
    Loop,
    Note,
    TimestepSlice
  }

  typedstruct do
    field(:loop, %Loop{},
      default: %Loop{
        start_timestep: 8,
        length: 8,
        timestep_slices: [
          %TimestepSlice{
            timestep: 0,
            notes: [
              %Note{
                instrument: "kick",
                key: 11,
                duration: 1
              }
            ]
          }
        ]
      }
    )
  end
end
