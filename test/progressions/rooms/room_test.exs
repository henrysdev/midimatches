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
    TestHelpers,
    Types.Configs.RoomConfig,
    Types.Configs.TimestepClockConfig,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  @loop %Loop{
    start_timestep: 8,
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

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  describe "room tree works as expected" do
    test "sets up supervision tree" do
      room_id = "1"

      {:ok, sup} = start_supervised({Room, [room_id]})

      started_children = Supervisor.which_children(sup) |> Enum.reverse()

      assert [
               {Server, _, :worker, [Server]},
               {Musicians, _, :supervisor, [Musicians]},
               {TimestepClock, _, :worker, [TimestepClock]}
               | _task
             ] = started_children
    end

    test "simulates a simple room session" do
      room_id = "1"

      config = %RoomConfig{
        timestep_clock: %TimestepClockConfig{
          timestep_us: 50_000,
          tick_in_timesteps: 4
        },
        musicians: []
      }

      timestep_slices = @loop.timestep_slices

      {:ok, _room} = start_supervised({Room, [room_id, config]})
      musicians_pid = Pids.fetch!({:musicians, room_id})
      1..2 |> Enum.each(&add_another_musician(musicians_pid, @loop, room_id, &1))
      :timer.sleep(2000)
      event_log = EventLog.get_room_log(room_id) |> Enum.take(10)

      assert timestep_slices == @loop.timestep_slices

      assert [
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 0}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.TickBroadcast{timestep_slices: []}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 1}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 2}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 3}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 4}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.TickBroadcast{timestep_slices: timestep_slices}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 5}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 6}
               },
               %{
                 timestamp: _,
                 event: %Progressions.Types.Events.ClockTimestep{timestep: 7}
               }
             ] = event_log
    end
  end

  defp add_another_musician(musicians_pid, loop, room_id, musician_id) do
    {:ok, musician_1} = Musicians.add_musician(musicians_pid, musician_id, room_id)
    Musician.new_loop(musician_1, loop)
  end
end
