defmodule Midimatches.Types.AdminMessage do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:message_text, String.t())
  end
end
