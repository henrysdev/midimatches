# defmodule Progressions.ServerTest do
#   use ExUnit.Case

#   alias Progressions.{
#     Rooms.Room.Server,
#     Rooms.Room.ServerAPI,
#     TestHelpers,
#     Types.Loop,
#     Types.Musician,
#     Types.Note,
#     Types.TimestepSlice
#   }

#   setup do
#     TestHelpers.teardown_rooms()
#     on_exit(fn -> TestHelpers.teardown_rooms() end)
#   end

#   @timestep_slices [
#     %TimestepSlice{
#       timestep: 0,
#       notes: [
#         %Note{
#           instrument: "Bassoon",
#           key: 22,
#           duration: 1
#         }
#       ]
#     },
#     %TimestepSlice{
#       timestep: 1,
#       notes: [
#         %Note{
#           instrument: "Bassoon",
#           key: 25,
#           duration: 1
#         }
#       ]
#     },
#     %TimestepSlice{
#       timestep: 2,
#       notes: [
#         %Note{
#           instrument: "Bassoon",
#           key: 26,
#           duration: 1
#         }
#       ]
#     },
#     %TimestepSlice{
#       timestep: 3,
#       notes: [
#         %Note{
#           instrument: "Bassoon",
#           key: 28,
#           duration: 1
#         }
#       ]
#     }
#   ]

#   test "receives new loop and broadcasts to clients" do
#     room_id = "abc123"
#     musician_id = "musician123"
#     room_topic = "room:#{room_id}"

#     loop = %Loop{
#       start_timestep: 2,
#       length: 4,
#       timestep_slices: @timestep_slices
#     }

#     expected_payload = %Phoenix.Socket.Broadcast{
#       topic: room_topic,
#       event: "broadcast_updated_musician_loop",
#       payload: %{
#         "musician_id" => musician_id,
#         "loop" => loop
#       }
#     }

#     {:ok, server} = Server.start_link([room_id])

#     ServerAPI.update_musician_loop(server, musician_id, loop)
#     ProgressionsWeb.Endpoint.subscribe(room_topic)

#     assert_receive ^expected_payload
#     ProgressionsWeb.Endpoint.unsubscribe(room_topic)
#   end

#   test "uses update_musician call to update musician fields" do
#     room_id = "abc123"
#     musician_id = "musician123"

#     musician = %Musician{
#       musician_id: musician_id
#     }

#     change_map = %{
#       view_state: %{
#         recording: %Loop{
#           start_timestep: 2,
#           length: 4,
#           timestep_slices: @timestep_slices
#         }
#       },
#       non_struct_key: "aaaa"
#     }

#     {:ok, server} = Server.start_link([room_id])
#     ServerAPI.add_musician(server, musician)
#     ServerAPI.update_musician(server, musician_id, change_map)
#     [actual_musician | _rest] = ServerAPI.get_musicians(server)

#     assert actual_musician.view_state == change_map.view_state
#     assert Map.has_key?(actual_musician, change_map.non_struct_key) == false
#   end
# end
