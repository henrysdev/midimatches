defmodule Progressions.Types.Configs.GameServerConfig do
  @moduledoc """
  Configurable fields for a new instance of a GameServer
  """

  use TypedStruct

  @default_timestep_us 500_000
  @default_quantization_threshold 0.5
  @default_max_rounds 3
  @default_game_size_num_players 3

  typedstruct do
    field(:timestep_us, integer(), default: @default_timestep_us)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:max_rounds, integer(), default: @default_max_rounds)
    field(:game_size_num_players, integer(), default: @default_game_size_num_players)
  end
end
