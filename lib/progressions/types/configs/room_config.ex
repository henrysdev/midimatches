defmodule Progressions.Types.Configs.RoomConfig do
  @moduledoc """
  Configurable fields for a new Room instance

  TODO example complete config structure

  TODO stop enforcing fields and set defaults here
  """

  use TypedStruct

  alias Progressions.Types.Configs.ServerConfig

  typedstruct do
    field(:loop_server, %ServerConfig{}, default: %ServerConfig{})
  end
end
