defmodule Midimatches.Types.ClientUser do
  @moduledoc """
  Configurable fields for a new instance of a Musician in a room
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    field(:user_id, String.t(), enforce: true)
    field(:user_alias, String.t(), enforce: true)
  end
end
