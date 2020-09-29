defmodule Progressions.Room.MusiciansTest do
  use ExUnit.Case, async: true

  alias Progressions.Rooms.Room.Musicians

  test "add musicians to room and lookup them up" do
    room_id = "room_id"

    {:ok, musician_pid} = Musicians.start_link([room_id])
    {:ok, _m1} = Musicians.add_musician(musician_pid, "1", room_id)
    {:ok, _m2} = Musicians.add_musician(musician_pid, "2", room_id)

    assert Musicians.musician_exists?("1", room_id) == true
    assert Musicians.musician_exists?("2", room_id) == true
  end
end
