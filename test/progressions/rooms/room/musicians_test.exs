defmodule Progressions.MusiciansTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "add musicians to room and lookup them up" do
    room_id = "1"

    {:ok, _room} = Room.start_link([room_id])
    musicians_pid = Pids.fetch!({:musicians, room_id})

    {:ok, _m1} = Musicians.add_musician(musicians_pid, "1", room_id)
    {:ok, _m2} = Musicians.add_musician(musicians_pid, "2", room_id)

    assert Musicians.musician_exists?("1", room_id) == true
    assert Musicians.musician_exists?("2", room_id) == true
  end
end
