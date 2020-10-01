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

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    [room_id, %{timestep_clock: clock_cfg}] =
      case args do
        [id] -> [id, @default_room_config]
        [id, cfg] -> [id, cfg]
        _ -> raise "Unsupported init args passed to Room init #{inspect(args, pretty: true)}"
      end

    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id]},
      {Musicians, [room_id]},
      {TimestepClock, [room_id, clock_cfg]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
