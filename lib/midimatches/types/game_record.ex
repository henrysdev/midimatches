defmodule Midimatches.Types.GameRecord do
  @moduledoc false

  alias Midimatches.{
    Types.GameRules,
    Types.PlayerOutcome,
    Types.RoundRecord
  }

  use TypedStruct

  @type id() :: String.t()

  typedstruct do
    field(:room_id, id(), enforce: true)
    # from :game_winners, :players, and :scores
    field(:game_outcomes, list(PlayerOutcome), enforce: true)
    # catchall to write game rules as JSON blob
    field(:game_rules, %GameRules{}, enforce: true)
    field(:round_records, %RoundRecord{}, enforce: true)
  end
end
