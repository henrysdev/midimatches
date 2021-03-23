defmodule Midimatches.Types.ChatMessage do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:sender_id, id())
    field(:sender_alias, String.t())
    field(:timestamp, integer())
    field(:message_text, String.t())
  end
end
