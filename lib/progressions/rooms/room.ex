defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Musicians,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock,
    Types.Configs.RoomConfig
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id]), do: init([room_id, %RoomConfig{}])

  def init([room_id, room_config = %RoomConfig{}]) do
    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id]},
      {Musicians, [room_id]},
      {TimestepClock, [room_id, room_config.timestep_clock]},
      {Task, fn -> Musicians.configure_musicians(room_config.musicians, room_id) end}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
