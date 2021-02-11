defmodule Midimatches.S3Client do
  @moduledoc """
  Provides functions for interacting with the application's Amazon S3 bucket(s)
  """

  @spec random_sample_beats(number()) :: any()
  @doc """
  Returns a list of random audio files from the sample beats bucket
  """
  def random_sample_beats(count) do
    # TODO fix this hack! mock the module
    case Mix.env() do
      :test ->
        []

      _ ->
        files_in_bucket("progressions-game", delimeter: "/", prefix: "sample-beats/")
        |> Enum.map(&String.replace(&1, "sample-beats/", ""))
        |> Enum.reject(&(&1 == ""))
        |> Enum.shuffle()
        |> Enum.take(count)
    end
  end

  @spec files_in_bucket(String.t(), list()) :: any()
  defp files_in_bucket(bucket, opts) do
    ExAws.S3.list_objects_v2(bucket, opts)
    |> ExAws.request!()
    |> get_in([:body, :contents])
    |> Enum.map(& &1.key)
  end
end
