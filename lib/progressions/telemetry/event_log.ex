defmodule Progressions.Telemetry.EventLog do
  @moduledoc """
  Provides an in-memory, in-order log of telemetry events for debugging sync issues
  """
  use Agent

  require Logger

  # TODO make max logs configureable
  @max_logs 128

  @doc """
  Starts a new event log
  """
  def start_link(_opts) do
    Agent.start_link(fn -> [] end, name: __MODULE__)
  end

  @doc """
  Returns the current event log
  """
  @spec get() :: list(term())
  def get do
    __MODULE__
    |> Agent.get(& &1)
    |> Enum.sort_by(& &1.timestamp, :asc)
  end

  @doc """
  Returns log for specified room
  """
  @spec get_room(String.t()) :: list(term())
  def get_room(room_id) do
    get()
    |> Enum.filter(&(&1.room_id == room_id))
  end

  @doc """
  Clears log
  """
  @spec clear() :: :ok
  def clear do
    Agent.update(__MODULE__, fn _ -> [] end)
  end

  @doc """
  Logs the given message and adds message to chronological in-memory log
  """
  @spec log(String.t(), String.t()) :: :ok
  def log(message, room_id) do
    event = %{
      message: message,
      timestamp: System.system_time(:microsecond),
      room_id: room_id
    }

    Logger.info(message)

    log_size =
      __MODULE__
      |> Agent.get(& &1)
      |> length()

    # garbage collect logs every once in awhile
    if log_size > @max_logs do
      clear()
    end

    Agent.update(__MODULE__, &[event | &1])
  end
end
