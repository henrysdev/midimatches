defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room,
    Rooms.RoomServer,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up supervision tree" do
    room_id = "1"

    {:ok, sup} = start_supervised({Room, [{room_id}]})

    started_children = Supervisor.which_children(sup) |> Enum.reverse()

    assert [
             {RoomServer, _, :worker, [RoomServer]}
           ] = started_children
  end
end
