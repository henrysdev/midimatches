defmodule Progressions.RoundEndTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.Views.RoundEnd,
    Rooms.Room.GameServer,
    Types.Player
  }

  test "advance view to next round (aka round_start)" do
    players =
      MapSet.new([
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
        },
        %Player{
          musician_id: "5",
          player_alias: "fum"
        },
        %Player{
          musician_id: "6",
          player_alias: "fum"
        },
        %Player{
          musician_id: "7",
          player_alias: "fum"
        },
        %Player{
          musician_id: "8",
          player_alias: "fum"
        }
      ])

    contestants = ["1", "2", "3", "4", "5", "6", "7", "8"]
    musicians = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      players: players,
      musicians: musicians,
      game_view: :round_end,
      contestants: contestants,
      recordings: %{},
      winner: "2"
    }

    actual_game_state = RoundEnd.advance_view(game_server_state)

    expected_game_state = %GameServer{
      contestants: ["1", "2", "3", "4", "5", "6", "7", "8"],
      game_view: :round_start,
      players: players,
      musicians: MapSet.new(["1", "2", "3", "4", "5", "6", "7", "8"]),
      ready_ups: MapSet.new(),
      recordings: %{},
      room_id: "1",
      round_recording_start_time: 0,
      view_counter: 0,
      votes: %{},
      winner: nil,
      round_num: 2
    }

    assert actual_game_state == expected_game_state
  end

  test "advance view to game_end" do
    players =
      MapSet.new([
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
      ])

    contestants = ["1", "2", "3", "4"]
    musicians = MapSet.new(contestants)

    scores = %{"1" => 0, "2" => 4, "3" => 2, "4" => 2}

    game_server_state = %GameServer{
      room_id: "1",
      players: players,
      musicians: musicians,
      game_view: :round_end,
      contestants: contestants,
      recordings: %{},
      scores: scores,
      winner: nil,
      round_num: 3
    }

    actual_game_state = RoundEnd.advance_view(game_server_state)

    expected_game_state = %GameServer{
      game_server_state
      | game_view: :game_end,
        winner: {"2", 4}
    }

    assert actual_game_state == expected_game_state
  end
end
