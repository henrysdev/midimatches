defmodule Progressions.Types.Configs.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance
  """

  use TypedStruct

  alias Progressions.Types.GameRules

  typedstruct do
    field(:room_name, String.t(), enforce: true)
    field(:server, %GameRules{}, default: %GameRules{})
  end
end
