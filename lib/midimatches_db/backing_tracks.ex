defmodule MidimatchesDb.BackingTracks do
  @moduledoc """
  DB boundary for BackingTrack objects
  """
  import Ecto.Query

  alias MidimatchesDb.{
    Repo,
    BackingTrack
  }

  @spec create_backing_track(%BackingTrack{}) :: %BackingTrack{}
  @doc """
  Insert a new backing track
  """
  def create_backing_track(%BackingTrack{} = backing_track) do
    Repo.insert!(backing_track)
  end

  @spec fetch_random_backing_tracks(integer()) :: list(BackingTrack)
  @doc """
  Fetches a specified count of randomly selected backing tracks
  """
  def fetch_random_backing_tracks(count \\ 100) do
    query =
      from(track in BackingTrack,
        select: track,
        limit: ^count,
        order_by: fragment("RANDOM()")
      )

    Repo.all(query)
  end
end
