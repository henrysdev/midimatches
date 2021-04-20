defmodule Midimatches.RecordingTest do
  use ExUnit.Case

  alias MidimatchesDb.BackingTrack

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.Views.Recording,
    Types.Player
  }

  test "advance view through entirely simulated recordings" do
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
      game_view: :recording,
      contestants: contestants,
      recordings: %{},
      sample_beats: [
        %BackingTrack{
          name: "footrack",
          author: "barsician",
          bpm: 110,
          musical_key: "C",
          file_url: "www.asdfasd.com/jalkasdg/das"
        }
      ]
    }

    %GameInstance{
      recordings: _recordings,
      game_view: _game_view
    } = Recording.advance_view(game_server_state)

    _expected_recordings = %{
      "1" => %{timestep_slices: []},
      "2" => %{timestep_slices: []},
      "3" => %{timestep_slices: []},
      "4" => %{timestep_slices: []}
    }

    # assert recordings == expected_recordings
    # assert game_view == :playback_voting
  end
end
