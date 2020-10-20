defmodule Progressions.Telemetry.EventLog do
  @moduledoc """
  Provides an in-memory, in-order log of telemetry events for debugging sync issues
  """
  use Agent

  require Logger

  alias Progressions.Types.{
    Events.ClockTimestep,
    Events.TickBroadcast,
    TimestepSlice
  }

  @type event() :: %{timestamp: integer(), event: %ClockTimestep{} | %TickBroadcast{}}
  @type id() :: String.t()

  # TODO make max logs configureable
  @max_logs 128

  @doc """
  Starts a new event log
  """
  def start_link(_opts) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Returns log for specified room
  """
  @spec get_room_log(id()) :: list(event())
  def get_room_log(room_id) do
    __MODULE__
    |> Agent.get(& &1)
    |> Map.get(room_id, [])
    |> Enum.sort_by(& &1.timestamp, :asc)
  end

  @doc """
  Clears log
  """
  @spec clear() :: :ok
  def clear do
    Agent.update(__MODULE__, fn _ -> %{} end)
  end

  @spec clock_timestep(integer(), id()) :: :ok
  def clock_timestep(timestep, room_id) do
    event = %{
      event: %ClockTimestep{
        timestep: timestep
      },
      timestamp: System.system_time(:microsecond)
    }

    append_event(event, room_id)
  end

  @spec tick_broadcast(list(%TimestepSlice{}), id()) :: :ok
  def tick_broadcast(timestep_slices, room_id) do
    event = %{
      event: %TickBroadcast{
        timestep_slices: timestep_slices
      },
      timestamp: System.system_time(:microsecond)
    }

    append_event(event, room_id)
  end

  @spec append_event(event(), id()) :: :ok
  defp append_event(event, room_id) do
    room_logs =
      __MODULE__
      |> Agent.get(& &1)
      |> Map.get(room_id, [])

    # garbage collect logs every once in awhile
    if length(room_logs) > @max_logs do
      clear()
    end

    Agent.update(__MODULE__, &Map.put(&1, room_id, [event | room_logs]))
  end
end
