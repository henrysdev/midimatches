defmodule Progressions.Room.MusicianTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Types.Loop,
    Types.Timestep,
    Types.Note
  }

  test "musician can play a loop" do
    room_id = "room_id"
    {:ok, _room} = Room.start_link(room_id)
    musicians_pid = Pids.fetch!({:musicians, room_id})
    {:ok, musician} = Musicians.add_musician(musicians_pid, "1", room_id)

    loop = %Loop{
      start_timestep: 0,
      length: 8,
      timestep_slices: [
        %Timestep{
          step: 0,
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
        %Timestep{
          step: 3,
          notes: [
            %Note{
              instrument: "epiano",
              key: 11,
              duration: 1
            }
          ]
        },
        %Timestep{
          step: 7,
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

    Musician.new_loop(musician, loop)

    :timer.sleep(2000)
  end
end
