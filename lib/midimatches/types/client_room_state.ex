defmodule Midimatches.Types.ClientRoomState do
  @moduledoc false

  use TypedStruct

  alias Midimatches.Types.{
    GameRules,
    Player
  }

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct do
    field(:room_id, id(), enforce: true)
    field(:room_name, String.t(), enforce: true)
    field(:num_curr_players, number(), enforce: true)
    field(:game_rules, %GameRules{}, enforce: true)
    field(:in_game, boolean(), enforce: true)
    field(:start_game_deadline, integer(), default: -1)
    field(:room_players, list(%Player{}), default: [])
  end
end
