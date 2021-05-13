defmodule Midimatches.RoundEndTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.Views.RoundEnd,
    Types.Player,
    Types.PlayerOutcome,
    Types.RoundRecord,
    Types.WinResult
  }

  alias MidimatchesDb, as: Db

  test "advance view to next round (aka round_start)" do
    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        },
        %Player{
          player_id: "4",
          player_alias: "fum"
        },
        %Player{
          player_id: "5",
          player_alias: "fum"
        },
        %Player{
          player_id: "6",
          player_alias: "fum"
        },
        %Player{
          player_id: "7",
          player_alias: "fum"
        },
        %Player{
          player_id: "8",
          player_alias: "fum"
        }
      ])

    contestants = ["1", "2", "3", "4", "5", "6", "7", "8"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :round_end,
      contestants: contestants,
      recordings: %{},
      game_winners: %WinResult{winners: ["2"], num_points: 2},
      sample_beats: []
    }

    actual_game_state = RoundEnd.advance_view(game_server_state)

    expected_game_state = %GameInstance{
      contestants: ["1", "2", "3", "4", "5", "6", "7", "8"],
      game_view: :round_start,
      players: players,
      player_ids_set: MapSet.new(["1", "2", "3", "4", "5", "6", "7", "8"]),
      ready_ups: MapSet.new(),
      recordings: %{},
      room_id: "1",
      game_id: "abc",
      round_recording_start_time: 0,
      view_counter: 0,
      votes: %{},
      game_winners: nil,
      round_num: 2,
      sample_beats: []
    }

    assert actual_game_state == expected_game_state
  end

  test "advance view to game_end" do
    players = default_players()

    contestants = ["1", "2", "3", "4"]
    player_ids_set = MapSet.new(contestants)

    scores = %{"1" => 0, "2" => 4, "3" => 2, "4" => 2}

    game_server_state = %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :round_end,
      contestants: contestants,
      recordings: %{},
      scores: scores,
      game_winners: nil,
      round_num: 3,
      sample_beats: []
    }

    actual_game_state = RoundEnd.advance_view(game_server_state)

    expected_game_state = %GameInstance{
      game_server_state
      | game_view: :game_end,
        game_winners: %WinResult{winners: ["2"], num_points: 4}
    }

    assert actual_game_state == expected_game_state
  end

  test "scores to win result" do
    scores = %{
      "a" => 0,
      "c" => 4,
      "b" => 2,
      "d" => 2,
      "e" => 4
    }

    actual_win_result = RoundEnd.scores_to_win_result(scores)

    expected_win_result = %WinResult{
      winners: ["c", "e"],
      num_points: 4
    }

    assert actual_win_result == expected_win_result
  end

  test "build round record for winner" do
    game_state = default_game_state()
    sample_beats = game_state.sample_beats

    %Db.BackingTrack{
      uuid: backing_track_id
    } = Enum.at(sample_beats, 0)

    round_record = RoundEnd.build_round_record(game_state)

    assert round_record == %RoundRecord{
             round_num: 1,
             round_outcomes: [
               %PlayerOutcome{
                 player_id: "1",
                 event_type: :round,
                 outcome: :lost,
                 num_points: 0
               },
               %PlayerOutcome{
                 player_id: "2",
                 event_type: :round,
                 outcome: :won,
                 num_points: 3
               },
               %PlayerOutcome{
                 player_id: "3",
                 event_type: :round,
                 outcome: :lost,
                 num_points: 1
               },
               %PlayerOutcome{
                 player_id: "4",
                 event_type: :round,
                 outcome: :lost,
                 num_points: 0
               }
             ],
             backing_track_id: backing_track_id
           }
  end

  test "build round record for tie" do
    game_state = default_game_state()
    sample_beats = game_state.sample_beats

    %Db.BackingTrack{
      uuid: backing_track_id
    } = Enum.at(sample_beats, 0)

    votes = %{"1" => "2", "2" => "3", "3" => "2", "4" => "3"}

    round_winners = %WinResult{
      winners: ["2", "3"],
      num_points: 2
    }

    game_state = %GameInstance{game_state | votes: votes, round_winners: round_winners}

    round_record = RoundEnd.build_round_record(game_state)

    assert round_record == %RoundRecord{
             round_num: 1,
             round_outcomes: [
               %PlayerOutcome{
                 player_id: "1",
                 event_type: :round,
                 outcome: :lost,
                 num_points: 0
               },
               %PlayerOutcome{
                 player_id: "2",
                 event_type: :round,
                 outcome: :tied,
                 num_points: 2
               },
               %PlayerOutcome{
                 player_id: "3",
                 event_type: :round,
                 outcome: :tied,
                 num_points: 2
               },
               %PlayerOutcome{
                 player_id: "4",
                 event_type: :round,
                 outcome: :lost,
                 num_points: 0
               }
             ],
             backing_track_id: backing_track_id
           }
  end

  defp default_players do
    MapSet.new([
      %Player{
        player_id: "1",
        player_alias: "foo"
      },
      %Player{
        player_id: "2",
        player_alias: "zoo"
      },
      %Player{
        player_id: "3",
        player_alias: "fee"
      },
      %Player{
        player_id: "4",
        player_alias: "fum"
      }
    ])
  end

  defp default_game_state() do
    players = default_players()
    contestants = ["1", "2", "3", "4"]
    player_ids_set = MapSet.new(contestants)
    scores = %{"1" => 0, "2" => 4, "3" => 2, "4" => 2}
    votes = %{"1" => "2", "2" => "3", "3" => "2", "4" => "2"}
    backing_track_id = UUID.uuid4()

    %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :round_end,
      contestants: contestants,
      recordings: %{},
      scores: scores,
      votes: votes,
      game_winners: nil,
      round_winners: %WinResult{
        winners: ["2"],
        num_points: 3
      },
      round_num: 1,
      sample_beats: [
        %Db.BackingTrack{
          uuid: backing_track_id
        }
      ]
    }
  end
end
