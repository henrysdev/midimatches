defmodule Midimatches.Types.ChatMessage do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:player_id, id())
    field(:timestamp, integer())
    field(:message_text, String.t())
  end
end
