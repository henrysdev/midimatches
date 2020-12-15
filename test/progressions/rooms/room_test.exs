defmodule Progressions.RoomTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room,
    Rooms.Room.GameServer,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up supervision tree" do
    room_id = "1"

    {:ok, sup} = start_supervised({Room, [{room_id}]})

    started_children = Supervisor.which_children(sup) |> Enum.reverse()

    assert [
             {GameServer, _, :worker, [GameServer]}
           ] = started_children
  end

  # test "simulates a simple room session" do
  #   room_id = "1"
  #   room_topic = "room:#{room_id}"

  #   config = %RoomConfig{
  #     server: %{
  #       timestep_us: 50_000,
  #       quantization_threshold: 0.7,
  #       musicians: []
  #     }
  #   }

  #   default_loop = %Loop{
  #     length: 12,
  #     start_timestep: 2,
  #     timestep_slices: []
  #   }

  #   new_loop = %Loop{
  #     start_timestep: 1,
  #     length: 99,
  #     timestep_slices: []
  #   }

  #   {:ok, _room} = start_supervised({Room, [{room_id, config}]})
  #   server = Pids.fetch!({:server, room_id})

  #   ServerAPI.add_musician(server, %Musician{
  #     musician_id: "mid1",
  #     loop: default_loop
  #   })

  #   ServerAPI.add_musician(server, %Musician{
  #     musician_id: "mid2",
  #     loop: default_loop
  #   })

  #   ServerAPI.update_musician_loop(server, "mid2", new_loop)

  #   expected_payload = %Phoenix.Socket.Broadcast{
  #     topic: room_topic,
  #     event: "broadcast_updated_musician_loop",
  #     payload: %{
  #       "musician_id" => "mid2",
  #       "loop" => new_loop
  #     }
  #   }

  #   ProgressionsWeb.Endpoint.subscribe(room_topic)

  #   assert_receive ^expected_payload
  #   ProgressionsWeb.Endpoint.unsubscribe(room_topic)

  #   state = :sys.get_state(server)

  #   assert %Progressions.Rooms.Room.Server{
  #            musicians: %{
  #              "mid1" => %Progressions.Types.Musician{
  #                loop: default_loop,
  #                musician_id: "mid1"
  #              },
  #              "mid2" => %Progressions.Types.Musician{
  #                loop: new_loop,
  #                musician_id: "mid2"
  #              }
  #            },
  #            room_id: "1",
  #            room_start_utc: _,
  #            quantization_threshold: 0.7,
  #            timestep_us: 50_000
  #          } = state
  # end
end
