defmodule Midimatches.Types.Configs.MidimatchesConfig do
  @moduledoc """
  Configuration for the midimatches application
  """

  use TypedStruct

  alias Midimatches.Types.Configs.RoomConfig

  typedstruct enforce: true do
    field(:rooms, list(%RoomConfig{}))
  end
end
