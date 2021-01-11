defmodule Progressions.Types.ClientGameState do
  @moduledoc """
  Configurable rules for a game
  """

  alias Progressions.{
    Types.GameRules
  }

  use TypedStruct

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct do
    # static fields
    field(:room_id, id())
    # TODO maybe add musicianId field and hydrate at handle_out?
    field(:game_rules, %GameRules{}, default: %GameRules{})

    field(:musicians, list(id))
    field(:num_votes_cast, integer())
    field(:ready_ups, list(id))
    # TODO recordings type
    field(:recordings, any)
    field(:round_recording_start_time, integer())
    field(:winner, id())
    field(:contestants, list(id))
    field(:judges, list(id))
  end
end
