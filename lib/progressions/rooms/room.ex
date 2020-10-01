defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Musicians,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock
  }

  @default_room_config %{
    timestep_clock: %{
      timestep_µs: 50_000,
      tick_in_timesteps: 4
    }
  }

  def start_link(room_id, room_config \\ @default_room_config) do
    Supervisor.start_link(__MODULE__, [room_id, room_config])
  end

  @impl true
  def init([room_id, %{timestep_clock: clock_cfg}]) do
    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id]},
      {Musicians, [room_id]},
      {TimestepClock, [room_id, clock_cfg]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
