defmodule Progressions.Types.GameRules do
  @moduledoc """
  Configurable fields for a new instance of a GameServer
  """

  alias Progressions.Types.GameRules.ViewTimeouts

  use TypedStruct

  @default_timestep_size 50
  @default_quantization_threshold 0.5
  @default_rounds_to_win 3
  @default_game_size_num_players 4
  @default_solo_time_limit 30
  @default_view_timeouts %ViewTimeouts{}

  @derive Jason.Encoder
  typedstruct do
    field(:timestep_size, integer(), default: @default_timestep_size)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:rounds_to_win, integer(), default: @default_rounds_to_win)
    field(:game_size_num_players, integer(), default: @default_game_size_num_players)
    field(:solo_time_limit, integer(), default: @default_solo_time_limit)
    field(:view_timeouts, map(), default: @default_view_timeouts)
  end
end
