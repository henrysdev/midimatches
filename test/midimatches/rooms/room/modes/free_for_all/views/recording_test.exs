defmodule Midimatches.RecordingTest do
  use ExUnit.Case

  alias MidimatchesDb.BackingTrack

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.Views.Recording,
    Types.Loop,
    Types.Note,
    Types.Player,
    Types.TimestepSlice
  }

  @recording_empty %Loop{
    timestep_size: 50,
    timestep_slices: []
  }

  @recording_default %Loop{
    timestep_size: 50,
    timestep_slices: [
      %TimestepSlice{
        timestep: 20,
        notes: [
          %Note{
            key: 10,
            duration: 20,
            velocity: 100
          }
        ]
      }
    ]
  }

  describe "advance view" do
    test "when all valid recordings, should set appropriate view timeout" do
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

      recordings =
        players
        |> Enum.map(fn player -> {player.player_id, @recording_default} end)
        |> Enum.into(%{})

      game_server_state = build_game_server_state_scaffold(players, recordings)

      actual_game_server_state = Recording.advance_view(game_server_state)

      assert :playback_voting == actual_game_server_state.game_view
      assert 88_200 == actual_game_server_state.game_rules.view_timeouts.playback_voting
    end

    test "when all invalid recordings, should set appropriate view timeout" do
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

      recordings =
        players
        |> Enum.map(fn player -> {player.player_id, @recording_empty} end)
        |> Enum.into(%{})

      game_server_state = build_game_server_state_scaffold(players, recordings)

      actual_game_server_state = Recording.advance_view(game_server_state)

      assert :playback_voting == actual_game_server_state.game_view
      assert 10_000 == actual_game_server_state.game_rules.view_timeouts.playback_voting
    end
  end

  defp build_game_server_state_scaffold(players, recordings) do
    contestants =
      players
      |> MapSet.to_list()
      |> Enum.map(& &1.player_id)

    player_ids_set = MapSet.new(contestants)

    %GameInstance{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :recording,
      contestants: contestants,
      recordings: recordings,
      sample_beats: [
        %BackingTrack{
          name: "footrack",
          author: "barsician",
          bpm: 60,
          musical_key: "C",
          file_url: "www.asdfasd.com/jalkasdg/das"
        }
      ]
    }
  end
end
