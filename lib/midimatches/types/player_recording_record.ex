defmodule Midimatches.Types.PlayerRecording do
  @moduledoc false

  alias Midimatches.Types.Loop

  use TypedStruct

  @type id() :: String.t()

  typedstruct do
    field(:recording, %Loop{}, enforce: true)
    field(:backing_track_id, id(), enforce: true)
    field(:player_id, id(), enforce: true)
  end
end
