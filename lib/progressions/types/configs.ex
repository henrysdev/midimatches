defmodule Progressions.Types.Configs do
  @moduledoc """
  Provides functions for interacting with configuration types
  """

  alias Progressions.Types.{
    Configs.ProgressionsConfig,
    Configs.RoomConfig,
    GameRules,
    GameRules.ViewTimeouts
  }

  # Schema to be followed for defining configurations
  @config_schema %ProgressionsConfig{
    rooms: [
      %RoomConfig{
        server: %GameRules{
          timestep_size: nil,
          quantization_threshold: nil,
          rounds_to_win: nil,
          game_size_num_players: nil,
          view_timeouts: %ViewTimeouts{
            game_start: nil,
            round_start: nil,
            recording: nil,
            playback_voting: nil,
            round_end: nil
          }
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
