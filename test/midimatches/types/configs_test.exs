defmodule Midimatches.Types.ConfigsTest do
  use ExUnit.Case

  alias Midimatches.Types.{
    Configs,
    Configs.MidimatchesConfig,
    Configs.RoomConfig,
    GameRules,
    GameRules.ViewTimeouts
  }

  @test_file ".test.json"

  setup do
    cleanup_file()
    on_exit(fn -> cleanup_file() end)
  end

  describe "configures application" do
    test "parses JSON config file" do
      json_content = """
      {
        "rooms": [
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          },
          {
            "room_name": "demo1",
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "min_players": 3,
              "view_timeouts": {
                "game_start": 10000,
                "round_start": 3000,
                "recording": 50000,
                "playback_voting": 90000,
                "round_end": 5000
              }
            }
          }
        ]
      }
      """

      expected = %MidimatchesConfig{
        rooms: [
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          },
          %RoomConfig{
            room_name: "demo1",
            server: %GameRules{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              min_players: 3,
              max_players: 4,
              pregame_countdown: 10_000,
              view_timeouts: %ViewTimeouts{
                game_start: 10_000,
                round_start: 3_000,
                recording: 50_000,
                playback_voting: 90_000,
                round_end: 5_000
              }
            }
          }
        ]
      }

      File.write!(@test_file, json_content)

      actual = Configs.parse_config(@test_file)

      assert expected == actual
    end
  end

  defp cleanup_file do
    File.rm(@test_file)
  end
end
