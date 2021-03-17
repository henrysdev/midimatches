defmodule MidimatchesWeb.MetaChannelTest do
  use MidimatchesWeb.ChannelCase, async: true

  alias MidimatchesWeb.{
    MetaChannel,
    UserSocket
  }

  alias Midimatches.TestHelpers

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(MetaChannel, "meta:common")

    %{socket: socket}
  end
end
