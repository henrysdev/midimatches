defmodule Midimatches.AdminTest do
  use ExUnit.Case

  alias Midimatches.{
    Admin,
    Types.AdminMessage
  }

  test "broadcasts admin message to all connected users" do
    message_text = "ahem. Hellooooo enjoy the gameeee"
    MidimatchesWeb.Endpoint.subscribe("meta:common")
    resp = Admin.broadcast_admin_message(message_text)

    assert resp == :ok

    assert_receive %Phoenix.Socket.Broadcast{
      topic: "meta:common",
      event: "admin_alert",
      payload: %AdminMessage{message_text: "ahem. Hellooooo enjoy the gameeee"}
    }
  end
end
