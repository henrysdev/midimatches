defmodule Midimatches.UtilsTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.RoomServer,
    Types.ClientGameState,
    Types.ClientRoomState,
    Types.GameRules,
    Types.Player,
    Types.User,
    Types.WinResult,
    Utils
  }

  test "transforms server state to client state" do
    players_list = [
      %Player{
        player_id: "3",
        player_alias: "fee"
      },
      %Player{
        player_id: "1",
        player_alias: "foo"
      },
      %Player{
        player_id: "4",
        player_alias: "fum"
      },
      %Player{
        player_id: "2",
        player_alias: "zoo"
      }
    ]

    players = MapSet.new(players_list)

    contestants = ["1", "2", "3", "4"]
    player_ids_set = MapSet.new(contestants)

    server_state = %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      votes: %{
        "1" => "4",
        "2" => "3",
        "3" => "4"
      },
      ready_ups: MapSet.new(["1", "2", "3"]),
      scores: %{
        "1" => 0,
        "2" => 0,
        "3" => 1,
        "4" => 2
      },
      game_winners: %WinResult{
        winners: ["4"],
        num_points: 2
      },
      round_winners: %WinResult{
        winners: ["3"],
        num_points: 1
      },
      recordings: %{
        "1" => %{
          timestep_slices: []
        }
      },
      sample_beats: ["track_1", "track2", "track3"]
    }

    actual_client_state = Utils.server_to_client_game_state(server_state)

    expected_client_state = %ClientGameState{
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,
      game_view: server_state.game_view,
      players: players_list,
      num_votes_cast: 3,
      ready_ups: ["1", "2", "3"],
      game_winners: %WinResult{
        winners: ["4"],
        num_points: 2
      },
      recordings: [
        [
          "1",
          %{
            timestep_slices: []
          }
        ]
      ],
      round_recording_start_time: server_state.round_recording_start_time,
      round_num: server_state.round_num,
      contestants: server_state.contestants,
      scores: [["1", 0], ["2", 0], ["3", 1], ["4", 2]],
      round_winners: server_state.round_winners,
      sample_beats: ["track_1", "track2", "track3"],
      view_deadline: -1
    }

    assert actual_client_state == expected_client_state
  end

  test "transforms server room state to client room state" do
    game_config = %GameRules{
      min_players: 5
    }

    server_room_state = %RoomServer{
      room_id: "1",
      room_name: "flight of the concords",
      game_config: game_config,
      game: self(),
      players: MapSet.new(["22", "33", "44", "55"])
    }

    expected_client_room_state = %ClientRoomState{
      room_id: "1",
      room_name: "flight of the concords",
      num_curr_players: 4,
      game_rules: game_config,
      in_game: true,
      room_players: ["22", "33", "44", "55"]
    }

    actual_client_room_state = Utils.server_to_client_room_state(server_room_state)

    assert actual_client_room_state == expected_client_room_state
  end

  describe "calc future timestamp" do
    test "returns accurate timestamp relative to current time by default" do
      ms_to_add = 10_000
      current = :os.system_time(:millisecond)
      actual_time = Utils.calc_future_timestamp(ms_to_add)

      expected_time = current + ms_to_add

      assert actual_time == expected_time
    end

    test "returns accurate timestamp relative to given time" do
      ms_to_add = 10_000
      start_time = 1_614_089_526_601
      actual_time = Utils.calc_future_timestamp(ms_to_add, start_time)

      expected_time = 1_614_089_536_601

      assert actual_time == expected_time
    end
  end

  test "user to player transform" do
    user = %User{
      user_id: "bob123",
      user_alias: "djdjdj"
    }

    expected_player = %Player{
      player_id: "bob123",
      player_alias: "djdjdj"
    }

    assert Utils.user_to_player(user) == expected_player
  end
end
