defmodule Progressions.Types.ClientGameState do
  @moduledoc """
  Configurable rules for a game
  """

  alias Progressions.{
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
    # TODO maybe add musicianId field and hydrate at handle_out?
    field(:game_rules, %GameRules{}, default: %GameRules{})

    field(:game_view, game_view())
    field(:players, list(Player.t()))
    field(:musicians, list(id))
    field(:num_votes_cast, integer())
    field(:ready_ups, list(id))
    field(:recordings, any)
    field(:round_recording_start_time, integer())
    field(:winner, id())
    field(:contestants, list(id))
    field(:round_num, integer())
    field(:scores, any)
    field(:round_winners, %WinResult{})
  end
end
