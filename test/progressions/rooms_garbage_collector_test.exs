defmodule Midimatches.RoomsGarbageCollectorTest do
  use ExUnit.Case

  alias Midimatches.{
    Pids,
    Rooms,
    Rooms.RoomServer,
    RoomsGarbageCollector,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "removes only stale rooms" do
    stale_room_id = "abc"
    fresh_room_id = "def"

    stale_server_deadline = :os.system_time(:millisecond) - 5_000
    fresh_server_deadline = :os.system_time(:millisecond) + 5_000

    Rooms.add_room(stale_room_id, "stale")
    Rooms.add_room(fresh_room_id, "fresh")

    stale_room_server = Pids.fetch!({:room_server, stale_room_id})
    fresh_room_server = Pids.fetch!({:room_server, fresh_room_id})

    :sys.replace_state(stale_room_server, fn state ->
      %RoomServer{state | created_at: stale_server_deadline}
    end)

    :sys.replace_state(fresh_room_server, fn state ->
      %RoomServer{state | created_at: fresh_server_deadline}
    end)

    assert Process.alive?(stale_room_server) == true
    assert Process.alive?(fresh_room_server) == true

    {:ok, _room_gc} = start_supervised({RoomsGarbageCollector, [{50}]})

    Process.sleep(100)

    assert Process.alive?(stale_room_server) == false
    assert Process.alive?(fresh_room_server) == true
  end
end
