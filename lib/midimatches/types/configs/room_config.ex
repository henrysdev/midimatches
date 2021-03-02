defmodule Midimatches.Types.Configs.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance
  """

  use TypedStruct

  alias Midimatches.Types.GameRules

  @derive Jason.Encoder
  typedstruct do
    field(:room_name, String.t(), enforce: true)
    field(:server, %GameRules{}, default: %GameRules{})
  end
end
