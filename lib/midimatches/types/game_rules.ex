defmodule Midimatches.Types.GameRules do
  @moduledoc """
  Configurable fields for a new instance of a GameServer
  """

  alias Midimatches.Types.GameRules.ViewTimeouts

  use TypedStruct

  @default_timestep_size 50
  @default_quantization_threshold 0.5
  @default_rounds_to_win 3
  @default_min_players 3
  @default_max_players 4
  @default_solo_time_limit 30_000
  @default_view_timeouts %ViewTimeouts{}
  @default_pregame_countdown 10_000
  @default_permanent_room false

  @derive Jason.Encoder
  typedstruct do
    field(:timestep_size, integer(), default: @default_timestep_size)
    field(:quantization_threshold, float(), default: @default_quantization_threshold)
    field(:rounds_to_win, integer(), default: @default_rounds_to_win)
    field(:min_players, integer(), default: @default_min_players)
    field(:max_players, integer(), default: @default_max_players)
    field(:solo_time_limit, integer(), default: @default_solo_time_limit)
    field(:view_timeouts, map(), default: @default_view_timeouts)
    # TODO move to room config
    field(:pregame_countdown, integer(), default: @default_pregame_countdown)
    # TODO move to room config
    field(:permanent_room, boolean(), default: @default_permanent_room)
  end
end
