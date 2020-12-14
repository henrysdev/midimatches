defmodule Progressions.Types.ConfigsTest do
  use ExUnit.Case

  alias Progressions.Types.{
    Configs,
    Configs.ProgressionsConfig,
    Configs.RoomConfig,
    Configs.ServerConfig,
    Loop,
    Musician,
    Note,
    TimestepSlice
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
              "timestep_us": 50000,
              "quantization_threshold": 0.4,
              "musicians": [
                {
                    "musician_id": "1foo",
                    "loop": {
                        "start_timestep": 0,
                        "length": 8,
                        "timestep_slices": [
                          {
                            "timestep": 0,
                            "notes": [
                              {
                                "instrument": "kick",
                                "key": 11,
                                "duration": 1
                              }
                            ]
                          }
                        ]
                      }
                },
                {
                  "musician_id": "2foo",
                  "loop": {
                      "start_timestep": 8,
                      "length": 8,
                      "timestep_slices": [
                        {
                          "timestep": 0,
                          "notes": [
                            {
                              "instrument": "epiano",
                              "key": 22,
                              "duration": 1
                            }
                          ]
                        },
                        {
                          "timestep": 0,
                          "notes": [
                            {
                              "instrument": "epiano",
                              "key": 24,
                              "duration": 1
                            }
                          ]
                        }
                      ]
                  }
                }
            ]
        }
          }
        ]
      }
      """

      expected = %ProgressionsConfig{
        rooms: [
          %RoomConfig{
            server: %ServerConfig{
              timestep_us: 50_000,
              quantization_threshold: 0.4,
              musicians: [
                %Musician{
                  musician_id: "1foo",
                  loop: %Loop{
                    length: 8,
                    start_timestep: 0,
                    timestep_slices: [
                      %TimestepSlice{
                        notes: [%Note{duration: 1, instrument: "kick", key: 11}],
                        timestep: 0
                      }
                    ]
                  }
                },
                %Musician{
                  musician_id: "2foo",
                  loop: %Loop{
                    length: 8,
                    start_timestep: 8,
                    timestep_slices: [
                      %TimestepSlice{
                        notes: [%Note{duration: 1, instrument: "epiano", key: 22}],
                        timestep: 0
                      },
                      %TimestepSlice{
                        notes: [%Note{duration: 1, instrument: "epiano", key: 24}],
                        timestep: 0
                      }
                    ]
                  }
                }
              ]
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
