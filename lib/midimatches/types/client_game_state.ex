defmodule Midimatches.Types.ClientGameState do
  @moduledoc false

  alias Midimatches.{
    Types.GameRules,
    Types.Player,
    Types.WinResult
  }

  use TypedStruct

  @type id() :: String.t()
  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]

  @derive Jason.Encoder
  typedstruct do
    # static fields
    field(:room_id, id())
    field(:game_rules, %GameRules{}, default: %GameRules{})

    field(:game_view, game_view())
    field(:players, list(Player.t()))
    field(:musicians, list(id))
    field(:num_votes_cast, integer())
    field(:ready_ups, list(id))
    field(:recordings, list(list))
    field(:round_recording_start_time, integer())
    field(:game_winners, %WinResult{})
    field(:contestants, list(id))
    field(:round_num, integer())
    field(:scores, list(list))
    field(:round_winners, %WinResult{})
    field(:sample_beats, list(String.t()))
  end
end
