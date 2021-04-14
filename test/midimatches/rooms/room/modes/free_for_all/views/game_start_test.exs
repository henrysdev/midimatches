defmodule Midimatches.GameStartTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.Views.GameStart,
    Types.Player
  }

  test "advance view through entirely simulated ready ups" do
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
        }
      ])

    contestants = ["1", "2", "3", "4"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :game_start,
      contestants: contestants,
      ready_ups: MapSet.new(),
      sample_beats: []
    }

    %GameInstance{
      ready_ups: ready_ups,
      game_view: game_view
    } = GameStart.advance_view(game_server_state)

    expected_ready_ups = MapSet.new(contestants)

    assert ready_ups == expected_ready_ups
    assert game_view == :round_start
  end
end
