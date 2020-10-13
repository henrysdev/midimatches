defmodule Progressions.Types.Configs.ProgressionsConfig do
  @moduledoc """
  Configuration for the progressions application
  """

  use TypedStruct

  alias Progressions.Types.Configs.RoomConfig

  typedstruct enforce: true do
    field(:rooms, list(%RoomConfig{}))
  end
end
