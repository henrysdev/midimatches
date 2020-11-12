defmodule Progressions.Types.Configs.LoopServerConfig do
  @moduledoc """
  Configurable fields for a new instance of a LoopServer in a room
  """

  use TypedStruct

  alias Progressions.Types.Musician

  @type id() :: String.t()
  @default_timestep_us 500_000

  typedstruct do
    field(:timestep_us, integer(), default: @default_timestep_us)
    field(:musicians, [%Musician{}], default: [])
  end
end
