defmodule Progressions.RoomSupervisorTest do
  use ExUnit.Case

  alias Progressions.{RoomSupervisor}

  test "sets up expected supervision tree for single room" do
    room_id = "abc123"

    {:ok, sup} = RoomSupervisor.start_link(room_id)

    assert [
             {Progressions.TimestepClock, _, :worker, [Progressions.TimestepClock]},
             {Progressions.Room, _, :worker, [Progressions.Room]}
           ] = Supervisor.which_children(sup)
  end
end
