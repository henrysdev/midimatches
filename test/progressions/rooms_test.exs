defmodule Progressions.RoomsTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up entire supervision tree" do
    room_ids = ["1", "asdf", "3"]

    Enum.each(room_ids, &Rooms.add_room(&1))

    Enum.each(room_ids, fn id ->
      assert Rooms.room_exists?(id) == true
    end)

    assert length(Rooms.list_rooms()) == length(room_ids)
  end

  test "prevents duplicate room ids" do
    room_ids = ["1", "asdf", "1"]

    [err_result | _rest] =
      room_ids
      |> Enum.map(&Rooms.add_room(&1))
      |> Enum.reverse()

    :sys.get_state(Rooms)

    assert {:error, "room already exists for room_id 1"} == err_result
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end

  test "adding and dropping children from tree removes from children and registry" do
    room_ids = ["1", "2", "3"]

    Enum.each(room_ids, &Rooms.add_room(&1))

    :sys.get_state(Rooms)
    :sys.get_state(ProcessRegistry)

    assert length(Rooms.list_rooms()) == length(room_ids)
    assert Pids.fetch({:room, "2"}) != nil

    Rooms.drop_room("2")

    :sys.get_state(Rooms)
    :sys.get_state(ProcessRegistry)

    assert Pids.fetch({:room, "2"}) == nil
    assert Pids.fetch({:game_server, "2"}) == nil
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end
end
