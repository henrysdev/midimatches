defmodule Progressions.Types.Configs.ServerConfig do
  @moduledoc """
  Configurable fields for a new instance of a Server in a room
  """

  use TypedStruct

  alias Progressions.Types.Musician

  @type id() :: String.t()
  @default_timestep_us 500_000
  @default_quantization_threshold 0.5

  typedstruct do
    field(:timestep_us, integer(), default: @default_timestep_us)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:musicians, [%Musician{}], default: [])
  end
end
