defmodule MidimatchesWeb.UserChannelTest do
  use MidimatchesWeb.ChannelCase, async: true

  alias MidimatchesWeb.{
    UserChannel,
    UserSocket
  }

  alias Midimatches.TestHelpers

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(UserChannel, "user:all")

    %{socket: socket}
  end
end
