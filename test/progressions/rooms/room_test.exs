defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.Rooms.{
    Room,
    Room.Musicians,
    Room.Server,
    Room.TimestepClock
  }

  test "sets up expected supervision tree for single room" do
    room_id = "abc123"

    {:ok, sup} = Room.start_link(room_id)

    assert [
             {TimestepClock, _, :worker, [TimestepClock]},
             {Musicians, _, :supervisor, [Musicians]},
             {Server, _, :worker, [Server]}
           ] = Supervisor.which_children(sup)
  end
end
