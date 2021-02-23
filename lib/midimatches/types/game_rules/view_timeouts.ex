defmodule Midimatches.Types.GameRules.ViewTimeouts do
  @moduledoc """
  Configurable fields for a new instance of a GameServer
  """

  use TypedStruct

  @default_game_start_timeout 10_000
  @default_round_start_timeout 3_000
  @default_recording_timeout 50_000
  @default_playback_voting_timeout 90_000
  @default_round_end_timeout 3_000
  @default_game_end_timeout 5_000

  @derive Jason.Encoder
  typedstruct do
    field(:game_start, integer(), default: @default_game_start_timeout)
    field(:round_start, integer(), default: @default_round_start_timeout)
    field(:recording, integer(), default: @default_recording_timeout)
    field(:playback_voting, integer(), default: @default_playback_voting_timeout)
    field(:round_end, integer(), default: @default_round_end_timeout)
    field(:game_end, integer(), default: @default_game_end_timeout)
  end
end
