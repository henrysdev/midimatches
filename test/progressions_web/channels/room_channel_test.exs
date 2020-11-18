defmodule ProgressionsWeb.RoomChannelTest do
  use ProgressionsWeb.ChannelCase, async: true

  alias ProgressionsWeb.{
    RoomChannel,
    UserSocket
  }

  alias Progressions.{
    Pids,
    Rooms,
    Rooms.Room.Server,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    Rooms.add_room("1")

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(RoomChannel, "room:1")

    %{socket: socket}
  end

  test "client joins existing room successfully", %{socket: socket} do
    RoomChannel.join("room:1", %{}, socket)

    actual_musicians =
      Pids.fetch!({:server, "1"})
      |> Server.get_musicians()
      |> Enum.map(& &1.musician_id)

    assert length(actual_musicians) == 2
  end

  test "client gets error when non existent room joined", %{socket: socket} do
    assert {:error, _} = RoomChannel.join("room:3", %{}, socket)
  end

  test "client sends update_musician_loop event and triggers broadcast_updated_musician_loop", %{
    socket: socket
  } do
    loop_json =
      %{
        start_timestep: 2,
        length: 8,
        timestep_slices: [
          %{
            timestep: 0,
            notes: [
              %{
                instrument: "tuba",
                key: 11,
                duration: 4
              }
            ]
          }
        ]
      }
      |> Jason.encode!()

    push(socket, "update_musician_loop", %{"loop" => loop_json})

    [_expected_musician_id | _] =
      Pids.fetch!({:server, "1"})
      |> Server.get_musicians()
      |> Enum.map(& &1.musician_id)

    assert_push("broadcast_updated_musician_loop", %{
      "musician_id" => _expected_musician_id,
      "loop" => loop_json
    })
  end
end
