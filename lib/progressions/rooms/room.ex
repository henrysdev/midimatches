defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock,
    Rooms.Room.Musicians
  }

  alias Progressions.Pids

  def start_link(room_id) do
    Supervisor.start_link(__MODULE__, room_id)
  end

  @impl true
  def init(room_id) do
    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id]},
      {Musicians, [room_id]},
      {TimestepClock, [room_id]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
