defmodule Midimatches.Types.GameRecord do
  @moduledoc false

  alias Midimatches.{
    Types.GameRules,
    Types.PlayerOutcome,
    Types.RoundRecord
  }

  use TypedStruct

  @type id() :: String.t()
  @type game_end_reason :: :completed | :canceled

  typedstruct do
    field(:game_outcomes, list(PlayerOutcome), enforce: true)
    field(:game_end_reason, game_end_reason(), enforce: true)
    field(:round_records, %RoundRecord{}, enforce: true)
  end
end
