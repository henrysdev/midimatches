defmodule Progressions.UtilsTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.GameServer,
    Types.ClientGameState,
    Types.Player,
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
      winner: {"4", 2}
    }

    actual_client_state = Utils.server_to_client_game_state(server_state)

    expected_client_state = %ClientGameState{
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,
      game_view: server_state.game_view,
      players: players_list,
      num_votes_cast: 3,
      ready_ups: ["1", "2", "3"],
      winner: %{
        winner_id: "4",
        num_votes: 2
      },
      recordings: server_state.recordings,
      round_recording_start_time: server_state.round_recording_start_time,
      round_num: server_state.round_num,
      contestants: server_state.contestants,
      scores: server_state.scores
    }

    assert actual_client_state == expected_client_state
  end
end
