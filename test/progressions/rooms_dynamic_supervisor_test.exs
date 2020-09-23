defmodule Progressions.RoomsDynamicSupervisorTest do
  use ExUnit.Case

  alias Progressions.{RoomsDynamicSupervisor}

  test "sets up entire supervision tree" do
    room_ids = ["1", "asdf", "3"]

    Enum.each(room_ids, &RoomsDynamicSupervisor.add_room(&1))

    Enum.each(room_ids, fn id ->
      assert RoomsDynamicSupervisor.room_exists?(id) == true
    end)

    assert length(RoomsDynamicSupervisor.children()) == length(room_ids)
  end

  test "prevents duplicate room ids" do
    room_ids = ["1", "asdf", "1"]

    [err_result | _rest] =
      room_ids
      |> Enum.map(&RoomsDynamicSupervisor.add_room(&1))
      |> Enum.reverse()

    assert {:error, "room already exists for room_id 1"} == err_result
  end
end
