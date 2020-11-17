defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.{
    Pids,
    Rooms.Room,
    Rooms.Room.Server,
    TestHelpers,
    Types.Configs.RoomConfig,
    Types.Loop,
    Types.Musician
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up supervision tree" do
    room_id = "1"

    {:ok, sup} = start_supervised({Room, [room_id]})

    started_children = Supervisor.which_children(sup) |> Enum.reverse()

    assert [{Server, _, :worker, [Server]}] = started_children
  end

  test "simulates a simple room session" do
    room_id = "1"
    room_topic = "room:#{room_id}"

    config = %RoomConfig{
      loop_server: %{
        timestep_us: 50_000,
        musicians: []
      }
    }

    default_loop = %Loop{
      length: 12,
      start_timestep: 2,
      timestep_slices: []
    }

    new_loop = %Loop{
      start_timestep: 1,
      length: 99,
      timestep_slices: []
    }

    {:ok, _room} = start_supervised({Room, [room_id, config]})
    loop_server = Pids.fetch!({:loop_server, room_id})

    Server.add_musician(loop_server, %Musician{
      musician_id: "mid1",
      loop: default_loop
    })

    Server.add_musician(loop_server, %Musician{
      musician_id: "mid2",
      loop: default_loop
    })

    Server.update_musician_loop(loop_server, "mid2", new_loop)

    expected_payload = %Phoenix.Socket.Broadcast{
      topic: room_topic,
      event: "update_musician_loop",
      payload: %{
        "musician_id" => "mid2",
        "loop" => new_loop
      }
    }

    ProgressionsWeb.Endpoint.subscribe(room_topic)

    assert_receive ^expected_payload
    ProgressionsWeb.Endpoint.unsubscribe(room_topic)

    state = :sys.get_state(loop_server)

    assert %Progressions.Rooms.Room.Server{
             musicians: %{
               "mid1" => %Progressions.Types.Musician{
                 loop: default_loop,
                 musician_id: "mid1"
               },
               "mid2" => %Progressions.Types.Musician{
                 loop: new_loop,
                 musician_id: "mid2"
               }
             },
             room_id: "1",
             room_start_utc: _,
             timestep_us: 50_000
           } = state
  end
end
