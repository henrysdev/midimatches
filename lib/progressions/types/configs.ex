defmodule Progressions.Types.Configs do
  @moduledoc """
  Provides functions for interacting with configuration types
  """

  alias Progressions.Types.{
    Configs.ProgressionsConfig,
    Configs.RoomConfig,
    Configs.ServerConfig,
    Loop,
    Musician,
    Note,
    TimestepSlice
  }

  # Schema to be followed for defining configurations
  @config_schema %ProgressionsConfig{
    rooms: [
      %RoomConfig{
        server: %ServerConfig{
          timestep_us: nil,
          musicians: [
            %Musician{
              musician_id: nil,
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
      }
    ]
  }

  @spec parse_config(Path.t()) :: %ProgressionsConfig{}
  @doc """
  Parses the provided JSON file into the expected configuration
  """
  def parse_config(cfg) do
    with {:ok, body} <- File.read(cfg),
         {:ok, json} <- Poison.decode(body, as: @config_schema),
         do: json
  end
end
