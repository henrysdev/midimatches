defmodule MidimatchesWeb.SampleController do
  @moduledoc """
  Provides JSON API for samples.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb.BackingTracks

  @spec random(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Gets a random sample of sample urls
  """
  def random(conn, %{"count" => count}) do
    samples =
      count
      |> String.to_integer()
      |> BackingTracks.fetch_random_backing_tracks()

    conn
    |> json(%{
      samples: samples
    })
  end
end
