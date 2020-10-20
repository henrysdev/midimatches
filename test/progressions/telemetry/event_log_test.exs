defmodule Progressions.Telemetry.EventLogTest do
  use ExUnit.Case, async: true

  alias Progressions.{
    Telemetry.EventLog,
    Types.Events.ClockTimestep,
    Types.Events.TickBroadcast,
    Types.TimestepSlice
  }

  setup do
    EventLog.clear()
    on_exit(fn -> EventLog.clear() end)
  end

  test "event log accepts logs and maintains chron ordering" do
    room_id = "1"

    timestep_slices = %TimestepSlice{
      notes: nil,
      timestep: nil
    }

    EventLog.clock_timestep(1, room_id)
    EventLog.tick_broadcast(timestep_slices, room_id)
    EventLog.clock_timestep(3, room_id)
    logs = EventLog.get_room_log(room_id)

    assert [
             %{event: %ClockTimestep{timestep: 1}, timestamp: _},
             %{event: %TickBroadcast{timestep_slices: timestep_slices}, timestamp: _},
             %{event: %ClockTimestep{timestep: 3}, timestamp: _}
           ] = logs
  end

  test "event log accepts logs and gets logs for single room" do
    room_id = "1"
    other_room_id = "2"

    timestep_slices = %TimestepSlice{
      notes: nil,
      timestep: nil
    }

    EventLog.clock_timestep(1, room_id)
    EventLog.tick_broadcast(timestep_slices, room_id)
    EventLog.clock_timestep(3, room_id)

    EventLog.clock_timestep(1, other_room_id)
    EventLog.tick_broadcast(timestep_slices, other_room_id)
    EventLog.clock_timestep(3, other_room_id)

    room_logs = EventLog.get_room_log(room_id)
    other_room_logs = EventLog.get_room_log(other_room_id)

    assert [
             %{event: %ClockTimestep{timestep: 1}, timestamp: _},
             %{event: %TickBroadcast{timestep_slices: timestep_slices}, timestamp: _},
             %{event: %ClockTimestep{timestep: 3}, timestamp: _}
           ] = room_logs

    assert [
             %{event: %ClockTimestep{timestep: 1}, timestamp: _},
             %{event: %TickBroadcast{timestep_slices: timestep_slices}, timestamp: _},
             %{event: %ClockTimestep{timestep: 3}, timestamp: _}
           ] = other_room_logs
  end

  test "event log clears" do
    room_id = "1"

    timestep_slices = %TimestepSlice{
      notes: nil,
      timestep: nil
    }

    EventLog.clock_timestep(1, room_id)
    EventLog.tick_broadcast(timestep_slices, room_id)
    EventLog.clock_timestep(3, room_id)
    EventLog.clear()

    logs = EventLog.get_room_log(room_id)

    assert logs == []
  end
end
