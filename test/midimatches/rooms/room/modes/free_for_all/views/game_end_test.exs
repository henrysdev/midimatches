defmodule Midimatches.GameEndTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.FreeForAllLogic,
    Rooms.Room.Modes.FreeForAll.Views.GameEnd,
    Types.GameRecord,
    Types.Player,
    Types.PlayerOutcome,
    Types.WinResult
  }

  alias MidimatchesDb, as: Db

  describe "build game record" do
    test "for completed game" do
      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          }
        ])

      historic_player_ids_set = MapSet.new(["1", "2", "3", "4"])

      contestants = ["1", "2"]
      player_ids_set = MapSet.new(contestants)

      game_server_state = %GameInstance{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
        historic_player_ids_set: historic_player_ids_set,
        game_view: :round_end,
        contestants: contestants,
        recordings: %{},
        game_winners: %WinResult{winners: ["2"], num_points: 2},
        round_winners: %WinResult{
          winners: contestants,
          num_points: 1
        },
        sample_beats: default_sample_beats(),
        scores: %{
          "1" => 3,
          "2" => 1
        },
        round_num: 3
      }

      game_record = GameEnd.build_game_record(game_server_state, :completed)

      expected_game_record = %GameRecord{
        game_end_reason: :completed,
        game_outcomes: [
          %PlayerOutcome{
            event_type: :game,
            num_points: 3,
            outcome: :lost,
            player_id: "1"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 1,
            outcome: :won,
            player_id: "2"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "3"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "4"
          }
        ],
        round_records: []
      }

      assert game_record == expected_game_record
    end

    test "with all losses if game canceled game with nobody left" do
      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          }
        ])

      historic_player_ids_set = MapSet.new(["1", "2", "3", "4"])

      contestants = ["1", "2"]
      player_ids_set = MapSet.new(contestants)

      game_server_state = %GameInstance{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
        historic_player_ids_set: historic_player_ids_set,
        game_view: :round_end,
        contestants: contestants,
        recordings: %{},
        round_winners: %WinResult{
          winners: contestants,
          num_points: 1
        },
        sample_beats: default_sample_beats(),
        scores: %{
          "1" => 3,
          "2" => 1
        },
        round_num: 3
      }

      %{state: game_server_state} = FreeForAllLogic.remove_player(game_server_state, "1")
      %{state: game_server_state} = FreeForAllLogic.remove_player(game_server_state, "2")

      game_record = GameEnd.build_game_record(game_server_state, :canceled)

      expected_game_record = %GameRecord{
        game_end_reason: :canceled,
        game_outcomes: [
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "1"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "2"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "3"
          },
          %PlayerOutcome{
            event_type: :game,
            num_points: 0,
            outcome: :lost,
            player_id: "4"
          }
        ],
        round_records: []
      }

      assert game_record == expected_game_record
    end
  end

  defp default_sample_beats do
    [
      %Db.BackingTrack{
        uuid: UUID.uuid4()
      },
      %Db.BackingTrack{
        uuid: UUID.uuid4()
      },
      %Db.BackingTrack{
        uuid: UUID.uuid4()
      }
    ]
  end
end
