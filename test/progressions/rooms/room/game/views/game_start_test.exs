defmodule Midimatches.GameStartTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.Game.Views.GameStart,
    Rooms.Room.GameServer,
    Types.Player
  }

  test "advance view through entirely simulated ready ups" do
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

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      musicians: musicians,
      game_view: :game_start,
      contestants: contestants,
      ready_ups: MapSet.new(),
      sample_beats: []
    }

    %GameServer{
      ready_ups: ready_ups,
      game_view: game_view
    } = GameStart.advance_view(game_server_state)

    expected_ready_ups = MapSet.new(contestants)

    assert ready_ups == expected_ready_ups
    assert game_view == :round_start
  end
end
