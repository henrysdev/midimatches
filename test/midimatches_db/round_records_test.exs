defmodule MidimatchesDb.RoundRecordsTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    BackingTrack,
    BackingTracks,
    GameRecord,
    GameRecords,
    RoundRecord,
    RoundRecords
  }

  test "create a round record" do
    game =
      %GameRecord{id: game_record_id} =
      GameRecords.create_game_record(%GameRecord{
        game_end_reason: :completed
      })

    backing_track =
      BackingTracks.create_backing_track(%BackingTrack{
        name: "another btrack",
        file_url: "asdgasdg.com",
        bpm: 100,
        musical_key: "A",
        author: "henry"
      })

    round_record = %RoundRecord{
      round_num: 1,
      backing_track_uuid: backing_track.uuid
    }

    round_record = Ecto.build_assoc(game, :round_records, round_record)

    inserted_round_record = RoundRecords.create_round_record(round_record)

    expected_round_record = %RoundRecord{
      game_record_id: game_record_id,
      round_num: 1,
      backing_track_uuid: backing_track.uuid
    }

    assertion_fields = [:round_num, :backing_track_uuid, :game_record_id]

    Enum.each(assertion_fields, fn field ->
      assert Map.get(inserted_round_record, field) == Map.get(expected_round_record, field)
    end)
  end
end
