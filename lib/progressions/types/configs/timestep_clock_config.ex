defmodule Progressions.Types.Configs.TimestepClockConfig do
  @moduledoc """
  Configurable fields for a new instance of a room's TimestepClock
  """

  use TypedStruct

  @timestep_us 50_000
  @tick_in_timesteps 4

  typedstruct do
    field(:timestep_us, integer(), default: @timestep_us)
    field(:tick_in_timesteps, integer(), default: @tick_in_timesteps)
  end
end
