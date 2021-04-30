defmodule Midimatches.Types.User do
  @moduledoc """
  Configurable fields for a new instance of a User object
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    field(:user_id, String.t())
    field(:user_alias, String.t(), enforce: true)
    field(:remote_ip, String.t())
  end
end
