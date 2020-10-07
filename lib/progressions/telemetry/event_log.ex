defmodule Progressions.Telemetry.EventLog do
  @moduledoc """
  Provides a rotating log of chronologically ordered events for use in tracking
  """
  use Agent

  @doc """
  Starts a new bucket.
  """
  def start_link(_opts) do
    Agent.start_link(fn -> %{} end)
  end

  @doc """
  Gets a value from the `bucket` by `key`.
  """
  def get(bucket, key) do
    Agent.get(bucket, &Map.get(&1, key))
  end

  @doc """
  Logs the given message
  """
  def log(bucket, key, value) do
    Agent.update(bucket, &Map.put(&1, key, value))
  end
end
