defmodule Progressions.Telemetry.EventLogTest do
  use ExUnit.Case, async: true

  alias Progressions.Telemetry.EventLog

  setup do
    EventLog.clear()
    on_exit(fn -> EventLog.get() end)
  end

  test "event log accepts logs and maintains chron ordering" do
    log_messages = [
      "log message 1",
      "log message 2"
    ]

    Enum.each(log_messages, &EventLog.log(&1, "room_1_id"))

    assert [
             %{message: "log message 1", timestamp: _},
             %{message: "log message 2", timestamp: _}
           ] = EventLog.get()
  end

  test "event log accepts logs and gets logs for single room" do
    log_messages = [
      {"log message 1", "room_1"},
      {"log message 2", "room_2"}
    ]

    Enum.each(log_messages, fn {msg, room_id} -> EventLog.log(msg, room_id) end)

    assert [
             %{message: "log message 1", timestamp: _}
           ] = EventLog.get_room("room_1")

    assert [
             %{message: "log message 2", timestamp: _}
           ] = EventLog.get_room("room_2")
  end

  test "event log clears" do
    log_messages = [
      "log message 1",
      "log message 2"
    ]

    Enum.each(log_messages, &EventLog.log(&1, "room_1_id"))
    EventLog.clear()

    assert [] == EventLog.get()
  end
end
