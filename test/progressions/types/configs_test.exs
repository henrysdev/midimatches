defmodule Progressions.Types.ConfigsTest do
  use ExUnit.Case

  alias Progressions.Types.{
    Configs,
    Configs.GameServerConfig,
    Configs.ProgressionsConfig,
    Configs.RoomConfig
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
            "server": {
              "timestep_size": 50000,
              "quantization_threshold": 0.4,
              "rounds_to_win": 2,
              "game_size_num_players": 3
            }
          }
        ]
      }
      """

      expected = %ProgressionsConfig{
        rooms: [
          %RoomConfig{
            server: %GameServerConfig{
              timestep_size: 50_000,
              quantization_threshold: 0.4,
              rounds_to_win: 2,
              game_size_num_players: 3
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
