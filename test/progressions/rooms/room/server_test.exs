defmodule Progressions.ServerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Server,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  @timestep_slices [
    %TimestepSlice{
      timestep: 0,
      notes: [
        %Note{
          instrument: "Bassoon",
          key: 22,
          duration: 1
        }
      ]
    },
    %TimestepSlice{
      timestep: 1,
      notes: [
        %Note{
          instrument: "Bassoon",
          key: 25,
          duration: 1
        }
      ]
    },
    %TimestepSlice{
      timestep: 2,
      notes: [
        %Note{
          instrument: "Bassoon",
          key: 26,
          duration: 1
        }
      ]
    },
    %TimestepSlice{
      timestep: 3,
      notes: [
        %Note{
          instrument: "Bassoon",
          key: 28,
          duration: 1
        }
      ]
    }
  ]

  test "receives new loop and broadcasts to clients" do
    room_id = "abc123"
    musician_id = "musician123"
    room_topic = "room:#{room_id}"

    loop = %Loop{
      start_timestep: 2,
      length: 4,
      timestep_slices: @timestep_slices
    }

    expected_payload = %Phoenix.Socket.Broadcast{
      topic: room_topic,
      event: "update_musician_loop",
      payload: %{
        "musician_id" => musician_id,
        "loop" => loop
      }
    }

    {:ok, loop_server} = Server.start_link([room_id])

    Server.update_musician_loop(loop_server, musician_id, loop)
    ProgressionsWeb.Endpoint.subscribe(room_topic)

    assert_receive ^expected_payload
    ProgressionsWeb.Endpoint.unsubscribe(room_topic)
  end
end
