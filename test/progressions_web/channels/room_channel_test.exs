defmodule MidimatchesWeb.RoomChannelTest do
  use MidimatchesWeb.ChannelCase

  alias MidimatchesWeb.{
    RoomChannel,
    UserSocket
  }

  alias Midimatches.{
    Rooms,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    Rooms.add_room("1", "foo")

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(RoomChannel, "room:1")
      |> enter_room("id1")

    %{socket: socket}
  end

  # test "client joins existing room successfully", %{socket: socket} do
  #   {:ok, :reply, _} =
  #     socket
  #     |> subscribe_and_join(RoomChannel, "room:1")
  #     |> enter_room("id2")

  #   room_server = Pids.fetch!({:room_server, "1"})

  #   %RoomServer{players: players_in_room} =
  #     room_server
  #     |> :sys.get_state()

  #   expected_num_musicians =
  #     players_in_room
  #     |> MapSet.size()

  #   assert expected_num_musicians == 2
  # end

  test "client gets error when non existent room joined", %{socket: socket} do
    assert {:error, _} = RoomChannel.join("room:3", %{}, socket)
  end

  defp enter_room({:ok, params, socket}, player_id, player_alias \\ "foo") do
    push(socket, "musician_enter_room", %{
      "player_alias" => player_alias,
      "player_id" => player_id
    })

    {:ok, params, socket}
  end
end
