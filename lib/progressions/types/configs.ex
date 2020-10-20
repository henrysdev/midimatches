defmodule Progressions.Types.Configs do
  @moduledoc """
  Provides functions for interacting with configuration types
  """

  alias Progressions.Types.{
    Configs.MusicianConfig,
    Configs.ProgressionsConfig,
    Configs.RoomConfig,
    Configs.TimestepClockConfig,
    Loop,
    Note,
    TimestepSlice
  }

  # Schema to be followed for defining configurations
  @config_schema %ProgressionsConfig{
    rooms: [
      %RoomConfig{
        timestep_clock: %TimestepClockConfig{
          timestep_us: nil,
          tick_in_timesteps: nil
        },
        musicians: [
          %MusicianConfig{
            loop: %Loop{
              length: nil,
              start_timestep: nil,
              timestep_slices: [
                %TimestepSlice{
                  notes: [
                    %Note{
                      duration: nil,
                      instrument: nil,
                      key: nil
                    }
                  ],
                  timestep: nil
                }
              ]
            }
          }
        ]
      }
    ]
  }

  @doc """
  Parses the provided JSON file into the expected configuration
  """
  @spec parse_config(Path.t()) :: %ProgressionsConfig{}
  def parse_config(cfg) do
    with {:ok, body} <- File.read(cfg),
         {:ok, json} <- Poison.decode(body, as: @config_schema),
         do: json
  end
end
