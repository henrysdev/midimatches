defmodule Progressions.Types.Configs.GameServerConfig do
  @moduledoc """
  Configurable fields for a new instance of a GameServer
  """

  use TypedStruct

  @default_timestep_size 500_000
  @default_quantization_threshold 0.5
  @default_rounds_to_win 2
  @default_game_size_num_players 3

  typedstruct do
    field(:timestep_size, integer(), default: @default_timestep_size)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:rounds_to_win, integer(), default: @default_rounds_to_win)
    field(:game_size_num_players, integer(), default: @default_game_size_num_players)
  end
end
