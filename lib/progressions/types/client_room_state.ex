defmodule Progressions.Types.ClientRoomState do
  @moduledoc false

  use TypedStruct

  alias Progressions.Types.GameRules

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct do
    field(:room_id, id(), enforce: true)
    field(:room_name, String.t(), enforce: true)
    field(:num_curr_players, number(), enforce: true)
    field(:game_rules, %GameRules{}, enforce: true)
  end
end
