defmodule Midimatches.UtilsTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameServer,
    Rooms.RoomServer,
    Types.ClientGameState,
    Types.ClientRoomState,
    Types.GameRules,
    Types.Player,
    Types.WinResult,
    Utils
  }

  test "transforms server state to client state" do
    players_list = [
      %Player{
        musician_id: "1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "3",
        player_alias: "fee"
      },
      %Player{
        musician_id: "4",
        player_alias: "fum"
      }
    ]

    players = MapSet.new(players_list)

    contestants = ["1", "2", "3", "4"]
    musicians = MapSet.new(contestants)

    server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      musicians: musicians,
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
        "1" => %{}
      }
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
      recordings: [["1", %{}]],
      round_recording_start_time: server_state.round_recording_start_time,
      round_num: server_state.round_num,
      contestants: server_state.contestants,
      scores: [["1", 0], ["2", 0], ["3", 1], ["4", 2]],
      round_winners: server_state.round_winners
    }

    assert actual_client_state == expected_client_state
  end

  describe "maps to win results" do
    test "works for votes" do
      votes = %{
        "a" => "c",
        "c" => "b",
        "b" => "c",
        "d" => "b",
        "e" => "d"
      }

      actual_win_result = Utils.votes_to_win_result(votes)

      expected_win_result = %WinResult{
        winners: ["b", "c"],
        num_points: 2
      }

      assert actual_win_result == expected_win_result
    end

    test "works for scores" do
      scores = %{
        "a" => 0,
        "c" => 4,
        "b" => 2,
        "d" => 2,
        "e" => 4
      }

      actual_win_result = Utils.scores_to_win_result(scores)

      expected_win_result = %WinResult{
        winners: ["c", "e"],
        num_points: 4
      }

      assert actual_win_result == expected_win_result
    end
  end

  test "transforms server room state to client room state" do
    game_config = %GameRules{
      game_size_num_players: 5
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
      in_game: true
    }

    actual_client_room_state = Utils.server_to_client_room_state(server_room_state)

    assert actual_client_room_state == expected_client_room_state
  end
end
