defmodule MidimatchesDb.GameRecordsTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    GameRecord,
    GameRecords
  }

  test "create a game record" do
    game_record = %GameRecord{
      game_end_reason: :canceled
    }

    inserted_game_record = GameRecords.create_game_record(game_record)

    expected_game_record = %GameRecord{
      game_end_reason: :canceled
    }

    assertion_fields = [:game_end_reason]

    Enum.each(assertion_fields, fn field ->
      assert Map.get(inserted_game_record, field) == Map.get(expected_game_record, field)
    end)
  end
end
