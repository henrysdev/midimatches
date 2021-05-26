defmodule Midimatches.Types.RoundRecord do
  @moduledoc false

  alias Midimatches.Types.{
    PlayerOutcome,
    RecordingRecord
  }

  use TypedStruct

  @type id() :: String.t()

  typedstruct do
    field(:round_num, integer(), enforce: true)
    field(:round_outcomes, list(PlayerOutcome), enforce: true)
    field(:player_recording_records, list(PlayerRecordingRecord), enforce: true)
    field(:backing_track_id, id(), enforce: true)
  end
end
