defmodule Progressions.Room.MusiciansTest do
  use ExUnit.Case, async: true

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians
  }

  test "add musicians to room and lookup them up" do
    room_id = "room_id"

    {:ok, _room} = Room.start_link(room_id)
    musicians_pid = Pids.fetch!({:musicians, room_id})

    {:ok, _m1} = Musicians.add_musician(musicians_pid, "1", room_id)
    {:ok, _m2} = Musicians.add_musician(musicians_pid, "2", room_id)

    assert Musicians.musician_exists?("1", room_id) == true
    assert Musicians.musician_exists?("2", room_id) == true
  end
end
