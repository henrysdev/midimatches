defmodule MidimatchesDb.PlayerRecordings do
  @moduledoc """
  DB boundary for PlayerRecording objects
  """

  alias MidimatchesDb.{
    PlayerRecording,
    Repo
  }

  # import Ecto.Query

  @spec create_player_recording(%PlayerRecording{}) :: %PlayerRecording{}
  @doc """
  Insert a new player recording
  """
  def create_player_recording(%PlayerRecording{} = player_recording) do
    Repo.insert(player_recording)
  end

  @spec bulk_create_player_recordings(list(%PlayerRecording{})) :: :ok | {:error, any()}
  @doc """
  Insert multiple player recordings
  """
  def bulk_create_player_recordings(player_recordings) when is_list(player_recordings) do
    if length(player_recordings) > 0 do
      errors =
        player_recordings
        |> Stream.map(&create_player_recording/1)
        |> Enum.reduce([], fn response, acc ->
          case response do
            {:error, reason} -> [reason | acc]
            _ -> acc
          end
        end)

      if length(errors) > 0 do
        {:error, errors}
      else
        :ok
      end
    else
      :ok
    end
  end

  # def get_random_recording do
  #   query =
  #     from(track in PlayerRecording,
  #       select: track,
  #       limit: 1,
  #       order_by: fragment("RANDOM()")
  #     )

  #   [%PlayerRecording{recording: recording}] = Repo.all(query)
  #   recording
  # end
end
