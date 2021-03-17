defmodule Midimatches.Types.AdminMessage do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()

  @default_alert_lifetime 10_000

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:message_text, String.t())
    field(:alert_lifetime, integer(), default: @default_alert_lifetime)
  end
end
