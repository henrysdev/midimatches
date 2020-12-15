defmodule Progressions.Types.Configs.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance
  """

  use TypedStruct

  alias Progressions.Types.Configs.GameServerConfig

  typedstruct do
    field(:server, %GameServerConfig{}, default: %GameServerConfig{})
  end
end
