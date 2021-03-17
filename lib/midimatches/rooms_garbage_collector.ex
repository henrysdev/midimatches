defmodule Midimatches.RoomsGarbageCollector do
  @moduledoc """
  Provides an actor-based cron job for removing stale rooms
  """
  alias Midimatches.{
    Rooms,
    Rooms.RoomServer,
    Utils
  }

  alias __MODULE__

  require Logger

  use GenServer

  # 1 hour cadence
  @default_gc_cadence 3_600_000

  def start_link(args) do
    GenServer.start_link(RoomsGarbageCollector, args)
  end

  def init(args) do
    gc_cadence =
      case args do
        [{gc_cadence}] -> gc_cadence
        _ -> @default_gc_cadence
      end

    Process.send_after(self(), {:scan_rooms}, gc_cadence)
    {:ok, %{gc_cadence: gc_cadence}}
  end

  def handle_info({:scan_rooms}, %{gc_cadence: gc_cadence} = state) do
    collect_rooms_garbage(gc_cadence)
    Process.send_after(self(), {:scan_rooms}, gc_cadence)
    {:noreply, state}
  end

  defp collect_rooms_garbage(gc_cadence) do
    garbage_before = Utils.curr_utc_timestamp() - gc_cadence

    Rooms.get_rooms_pid_list()
    |> Enum.filter(&RoomServer.stale?(&1, garbage_before))
    |> Enum.map(&:sys.get_state(&1).room_id)
    |> Enum.map(fn room_id ->
      Logger.warn("Rooms garbage collector: removing room #{room_id}")
      room_id
    end)
    |> Enum.map(&Rooms.drop_room(&1))
  end
end
