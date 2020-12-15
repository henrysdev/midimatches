defmodule Progressions.Types.Configs do
  @moduledoc """
  Provides functions for interacting with configuration types
  """

  alias Progressions.Types.{
    Configs.GameServerConfig,
    Configs.ProgressionsConfig,
    Configs.RoomConfig
  }

  # Schema to be followed for defining configurations
  @config_schema %ProgressionsConfig{
    rooms: [
      %RoomConfig{
        server: %GameServerConfig{
          timestep_us: nil,
          quantization_threshold: nil,
          rounds_to_win: nil,
          game_size_num_players: nil
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
