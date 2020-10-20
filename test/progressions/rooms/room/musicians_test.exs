defmodule Progressions.MusiciansTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Telemetry.EventLog,
    TestHelpers,
    Types.Configs.MusicianConfig,
    Types.Configs.RoomConfig,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  @musician_config %MusicianConfig{
    loop: %Loop{
      start_timestep: 8,
      length: 8,
      timestep_slices: [
        %TimestepSlice{
          timestep: 0,
          notes: [
            %Note{
              instrument: "crazybass",
              key: 12,
              duration: 1
            }
          ]
        }
      ]
    }
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "configures default musician if no config provided" do
    room_id = "1"

    {:ok, room} = start_supervised({Room, [room_id]})
    musicians_pid = Pids.fetch!({:musicians, room_id})
    :sys.get_state(musicians_pid)
    :sys.get_state(room)
    musicians = Musicians.list_musicians(musicians_pid)

    assert [
             {:undefined, _, :worker, [Musician]}
           ] = musicians
  end

  describe "configured musicians" do
    test "instantiate configured musicians correctly" do
      room_id = "1"

      room_config = %RoomConfig{
        musicians: [@musician_config]
      }

      {:ok, room} = start_supervised({Room, [room_id, room_config]})
      :sys.get_state(room)
      :sys.get_state(ProcessRegistry)
      musicians = Pids.fetch!({:musicians, room_id})
      [{_, default_musician, _, _}] = Musicians.list_musicians(musicians)
      state = :sys.get_state(default_musician)

      assert %Musician{
               active_loop: %Loop{
                 length: 8,
                 start_timestep: 8,
                 timestep_slices: [
                   %TimestepSlice{
                     notes: [
                       %Note{
                         duration: 1,
                         instrument: "crazybass",
                         key: 12
                       }
                     ],
                     timestep: 0
                   }
                 ]
               },
               last_timestep: _,
               musician_id: _,
               playhead: _,
               potential_loop: nil,
               room_id: room_id,
               server: _
             } = state
    end

    test "generate expected event log" do
      room_id = "1"

      room_config = %RoomConfig{
        musicians: [@musician_config]
      }

      {:ok, room} = start_supervised({Room, [room_id, room_config]})
      :sys.get_state(room)

      :timer.sleep(2000)

      _first_two_measures =
        room_id
        |> EventLog.get_room_log()
        |> Enum.take(16)
    end
  end

  describe "added musicians" do
    test "add additional musicians to a started room" do
      room_id = "1"

      {:ok, _room} = start_supervised({Room, [room_id]})
      musicians_pid = Pids.fetch!({:musicians, room_id})

      {:ok, _m1} = Musicians.add_musician(musicians_pid, "1", room_id)
      {:ok, _m2} = Musicians.add_musician(musicians_pid, "2", room_id)

      child_count =
        musicians_pid
        |> Musicians.list_musicians()
        |> length()

      assert Musicians.musician_exists?("1", room_id) == true
      assert Musicians.musician_exists?("2", room_id) == true
      assert child_count == 3
    end
  end
end
