defmodule Progressions.RoomSupervisor do
  use Supervisor

  alias Progressions.{
    Room,
    TimestepClock
  }

  def start_link(room_id) do
    Supervisor.start_link(__MODULE__, room_id)
  end

  @impl true
  def init(room_id) do
    children = [
      {Room, [room_id]},
      {TimestepClock, [room_id]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
