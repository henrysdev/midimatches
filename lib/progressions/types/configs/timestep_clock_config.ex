defmodule Progressions.Types.Configs.TimestepClockConfig do
  @moduledoc """
  Configurable fields for a new instance of a room's TimestepClock
  """

  use TypedStruct

  typedstruct enforce: true do
    field(:timestep_us, integer())
    field(:tick_in_timesteps, integer())
  end
end
