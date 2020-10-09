defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock,
    Telemetry.EventLog,
    Types.Loop,
    Types.Note,
    Types.RoomConfig,
    Types.TimestepClockConfig,
    Types.TimestepSlice
  }

  setup do
    EventLog.clear()
    on_exit(fn -> EventLog.get() end)
  end

  test "sets up expected supervision tree for single room" do
    room_id = "abc123"

    {:ok, sup} = Room.start_link([room_id])

    assert [
             {TimestepClock, _, :worker, [TimestepClock]},
             {Task, _, :worker, [Task]},
             {Musicians, _, :supervisor, [Musicians]},
             {Server, _, :worker, [Server]}
           ] = Supervisor.which_children(sup)
  end

  test "can simulate a room session" do
    room_id = "xyx"

    config = %RoomConfig{
      timestep_clock: %TimestepClockConfig{
        timestep_µs: 50_000,
        tick_in_timesteps: 4
      },
      musicians: []
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

    {:ok, _room} = Room.start_link([room_id, config])

    musicians_pid = Pids.fetch!({:musicians, room_id})

    1..2 |> Enum.each(&add_another_musician(musicians_pid, loop, room_id, &1))

    # TODO when assert is used to match event logs, it messes up the chron ordering... investigate
    :timer.sleep(2000)

    event_log = EventLog.get_room(room_id) |> Enum.take(8)

    assert [
             %{message: "clock_timestep=1", timestamp: _},
             %{message: "clock_timestep=2", timestamp: _},
             %{message: "clock_timestep=3", timestamp: _},
             %{message: "clock_timestep=4", timestamp: _},
             %{
               message:
                 "broadcast timestep_slices: [%Progressions.Types.TimestepSlice{notes: [%Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 11}, %Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 14}], timestep: 0}, %Progressions.Types.TimestepSlice{notes: [%Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 11}, %Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 14}], timestep: 0}, %Progressions.Types.TimestepSlice{notes: [%Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 11}], timestep: 3}, %Progressions.Types.TimestepSlice{notes: [%Progressions.Types.Note{duration: 1, instrument: \"epiano\", key: 11}], timestep: 3}]",
               timestamp: _
             },
             %{message: "clock_timestep=5", timestamp: _},
             %{message: "clock_timestep=6", timestamp: _},
             %{message: "clock_timestep=7", timestamp: _}
           ] = event_log
  end

  test "can simulate a room session from default configs" do
    # TODO flesh out test
  end

  defp add_another_musician(musicians_pid, loop, room_id, musician_id) do
    {:ok, musician_1} = Musicians.add_musician(musicians_pid, musician_id, room_id)
    Musician.new_loop(musician_1, loop)
  end
end
