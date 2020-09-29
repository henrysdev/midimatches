defmodule Progressions.RoomsTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms
  }

  setup do
    reset_rooms()
    on_exit(fn -> reset_rooms() end)
  end

  test "sets up entire supervision tree" do
    room_ids = ["1", "asdf", "3"]

    Enum.each(room_ids, &Rooms.add_room(&1))

    # Allow plenty of time for registry to cleanup after removal
    :timer.sleep(600)

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

    assert {:error, "room already exists for room_id 1"} == err_result
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end

  test "adding and dropping children from tree removes from children and registry" do
    room_ids = ["1", "2", "3"]

    Enum.each(room_ids, &Rooms.add_room(&1))

    assert length(Rooms.list_rooms()) == length(room_ids)
    assert Pids.fetch({:room, "2"}) != nil
    assert Pids.fetch({:server, "2"}) != nil
    assert Pids.fetch({:timestep_clock, "2"}) != nil
    assert Pids.fetch({:musicians, "2"}) != nil

    Rooms.drop_room("2")

    # Allow plenty of time for registry to cleanup after removal
    :timer.sleep(600)

    assert Pids.fetch({:room, "2"}) == nil
    assert Pids.fetch({:server, "2"}) == nil
    assert Pids.fetch({:timestep_clock, "2"}) == nil
    assert Pids.fetch({:musicians, "2"}) == nil
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end

  defp reset_rooms() do
    Rooms.list_rooms()
    |> Enum.map(fn {_, pid, _, _} -> pid end)
    |> Enum.each(&DynamicSupervisor.terminate_child(Rooms, &1))
  end
end
