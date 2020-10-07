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
    Types.Loop,
    Types.MusicianConfig,
    Types.Note,
    Types.RoomConfig,
    Types.TimestepClockConfig,
    Types.TimestepSlice
  }

  @default_room_config %RoomConfig{
    timestep_clock: %TimestepClockConfig{
      timestep_µs: 50_000,
      tick_in_timesteps: 4
    },
    musicians: [
      %MusicianConfig{
        loop: %Loop{
          start_timestep: 0,
          length: 8,
          timestep_slices: [
            %TimestepSlice{
              timestep: 0,
              notes: [
                %Note{
                  instrument: "kick",
                  key: 11,
                  duration: 1
                }
              ]
            }
          ]
        }
      }
    ]
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id]), do: init([room_id, @default_room_config])

  def init([room_id, room_config = %RoomConfig{}]) do
    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id]},
      {Musicians, [room_id]},
      {Task, fn -> Musicians.configure_musicians(room_config.musicians, room_id) end},
      {TimestepClock, [room_id, room_config.timestep_clock]}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
