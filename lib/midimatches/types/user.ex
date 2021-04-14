defmodule Midimatches.Types.User do
  @moduledoc """
  Configurable fields for a new instance of a User object
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    field(:user_id, String.t(), enforce: true)
    field(:user_alias, String.t(), enforce: true)
    field(:remote_ip, String.t())
    field(:password, String.t())
    field(:email, String.t())
    field(:verified?, boolean(), default: false)
  end
end
