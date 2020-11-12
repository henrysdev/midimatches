defmodule ProgressionsWeb.RoomChannelTest do
  use ProgressionsWeb.ChannelCase, async: true

  alias ProgressionsWeb.{
    RoomChannel,
    UserSocket
  }

  alias Progressions.Rooms

  setup do
    Rooms.add_room("1")

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(RoomChannel, "room:1")

    %{socket: socket}
  end

  # test "User can receive tick broadcasts", %{socket: _socket} do
  #   assert_push(ref, %{"timestep_slices" => []}, 1000)
  # end

  # test "User can send play_note events", %{socket: _socket} do
  #   # TODO flesh out when implementing note play event handling
  #   # ref = push(socket, "play_note", %{"body" => "foobarzoo"})
  # end
end
