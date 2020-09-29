defmodule Progressions.RoomsTest do
  use ExUnit.Case

  alias Progressions.Rooms

  test "sets up entire supervision tree" do
    room_ids = ["1", "asdf", "3"]

    Enum.each(room_ids, &Rooms.add_room(&1))

    Enum.each(room_ids, fn id ->
      assert Rooms.room_exists?(id) == true
    end)

    assert length(Rooms.children()) == length(room_ids)
  end

  test "prevents duplicate room ids" do
    room_ids = ["1", "asdf", "1"]

    [err_result | _rest] =
      room_ids
      |> Enum.map(&Rooms.add_room(&1))
      |> Enum.reverse()

    assert {:error, "room already exists for room_id 1"} == err_result
  end
end
