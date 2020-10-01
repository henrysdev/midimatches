defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
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

  test "can simulate a room session" do
    room_id = "1"

    config = %{
      timestep_clock: %{
        timestep_µs: 50_000,
        tick_in_timesteps: 4
      }
    }

    loop = %Loop{
      start_timestep: 0,
      length: 8,
      timestep_slices: [
        %TimestepSlice{
          timestep: 0,
          notes: [
            %Note{
              instrument: "epiano",
              key: 11,
              duration: 1
            },
            %Note{
              instrument: "epiano",
              key: 14,
              duration: 1
            }
          ]
        },
        %TimestepSlice{
          timestep: 3,
          notes: [
            %Note{
              instrument: "epiano",
              key: 11,
              duration: 1
            }
          ]
        },
        %TimestepSlice{
          timestep: 7,
          notes: [
            %Note{
              instrument: "tuba",
              key: 42,
              duration: 1
            }
          ]
        }
      ]
    }

    {:ok, _room} = Room.start_link(room_id, config)

    musicians_pid = Pids.fetch!({:musicians, room_id})

    1..2 |> Enum.each(&add_another_musician(musicians_pid, loop, room_id, &1))

    :timer.sleep(2000)
  end

  defp add_another_musician(musicians_pid, loop, room_id, musician_id) do
    {:ok, musician_1} = Musicians.add_musician(musicians_pid, musician_id, room_id)
    Musician.new_loop(musician_1, loop)
  end
end
