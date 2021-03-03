defmodule MidimatchesWeb.SampleController do
  @moduledoc """
  Provides JSON API for samples.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.S3ClientProxy

  @spec random(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Gets a random sample of sample urls
  """
  def random(conn, %{"count" => count}) do
    samples =
      count
      |> String.to_integer()
      |> S3ClientProxy.random_sample_beats()

    conn
    |> json(%{
      samples: samples
    })
  end
end
