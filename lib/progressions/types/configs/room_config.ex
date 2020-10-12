defmodule Progressions.Types.Configs.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance

  TODO example complete config structure

  TODO stop enforcing fields and set defaults here
  """

  use TypedStruct

  alias Progressions.Types.Configs.{
    MusicianConfig,
    TimestepClockConfig
  }

  typedstruct enforce: true do
    field(:timestep_clock, %TimestepClockConfig{})
    field(:musicians, list(%MusicianConfig{}))
  end
end
