defmodule Progressions.Types.Configs.MusicianConfig do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  alias Progressions.Types.Loop

  typedstruct do
    field(:musician_id, integer())
    field(:loop, %Loop{})
  end
end
