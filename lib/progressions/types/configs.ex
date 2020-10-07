defmodule Progressions.Types.MusicianConfig do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  alias Progressions.Types.Loop

  typedstruct do
    field(:musician_id, integer())
    field(:loop, %Loop{})
  end
end

defmodule Progressions.Types.TimestepClockConfig do
  @moduledoc """
  Configurable fields for a new instance of a room's TimestepClock
  """

  use TypedStruct

  typedstruct enforce: true do
    field(:timestep_µs, integer())
    field(:tick_in_timesteps, integer())
  end
end

defmodule Progressions.Types.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance

  TODO example complete config structure

  TODO stop enforcing fields and set defaults here
  """

  use TypedStruct

  alias Progressions.Types.{
    MusicianConfig,
    TimestepClockConfig
  }

  typedstruct enforce: true do
    field(:timestep_clock, %TimestepClockConfig{})
    field(:musicians, list(%MusicianConfig{}))
  end
end
