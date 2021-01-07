defmodule Progressions.Types.GameRules do
  @moduledoc """
  Configurable rules for a game
  """

  use TypedStruct

  @default_timestep_size 500_000
  @default_quantization_threshold 0.5
  @default_rounds_to_win 2
  @default_game_size_num_players 3
  @default_solo_time_limit 30

  typedstruct do
    field(:timestep_size, integer(), default: @default_timestep_size)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:rounds_to_win, integer(), default: @default_rounds_to_win)
    field(:game_size_num_players, integer(), default: @default_game_size_num_players)
    field(:solo_time_limit, integer(), default: @default_solo_time_limit)
  end
end
