defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.Rooms.Room.{
    Server,
    TimestepClock
  }

  def start_link(room_id) do
    Supervisor.start_link(__MODULE__, room_id)
  end

  @impl true
  def init(room_id) do
    children = [
      {Server, [room_id]},
      {TimestepClock, [room_id]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
