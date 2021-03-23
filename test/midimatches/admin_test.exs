defmodule Midimatches.AdminTest do
  use ExUnit.Case
  use MidimatchesWeb.ChannelCase

  alias Midimatches.{
    Admin,
    TestHelpers,
    Types.AdminMessage,
    Types.User,
    UserCache
  }

  alias MidimatchesWeb.{
    UserChannel,
    UserSocket
  }

  setup do
    on_exit(fn -> TestHelpers.flush_user_cache() end)
  end

  describe "alert all users" do
    test "with just a message to all connected users" do
      message_text = "ahem. Hellooooo enjoy the gameeee"
      MidimatchesWeb.Endpoint.subscribe("user:all")
      resp = Admin.alert_all_users(message_text)

      assert resp == :ok

      assert_receive %Phoenix.Socket.Broadcast{
        topic: "user:all",
        event: "admin_alert",
        payload: %{
          admin_message: %AdminMessage{message_text: "ahem. Hellooooo enjoy the gameeee"}
        }
      }
    end

    test "with a message and alert lifetime to all connected users" do
      message_text = "ahem. Hellooooo enjoy the gameeee"
      alert_lifetime = 10_000

      MidimatchesWeb.Endpoint.subscribe("user:all")
      resp = Admin.alert_all_users(message_text, alert_lifetime)

      assert resp == :ok

      assert_receive %Phoenix.Socket.Broadcast{
        topic: "user:all",
        event: "admin_alert",
        payload: %{
          admin_message: %AdminMessage{
            message_text: "ahem. Hellooooo enjoy the gameeee",
            alert_lifetime: 10_000
          }
        }
      }
    end
  end

  describe "alert user" do
    test "with just a message to the single connected user" do
      message_text = "ahem. Hellooooo enjoy the gameeee"
      MidimatchesWeb.Endpoint.subscribe("user:abc123")
      resp = Admin.alert_user("abc123", message_text)

      assert resp == :ok

      assert_receive %Phoenix.Socket.Broadcast{
        topic: "user:abc123",
        event: "admin_alert",
        payload: %{
          admin_message: %AdminMessage{message_text: "ahem. Hellooooo enjoy the gameeee"}
        }
      }
    end

    test "with a message and alert lifetime to the single connected user" do
      message_text = "ahem. Hellooooo enjoy the gameeee"
      alert_lifetime = 10_000

      MidimatchesWeb.Endpoint.subscribe("user:abc123")
      resp = Admin.alert_user("abc123", message_text, alert_lifetime)

      assert resp == :ok

      assert_receive %Phoenix.Socket.Broadcast{
        topic: "user:abc123",
        event: "admin_alert",
        payload: %{
          admin_message: %AdminMessage{
            message_text: "ahem. Hellooooo enjoy the gameeee",
            alert_lifetime: 10_000
          }
        }
      }
    end
  end

  describe "list active users" do
    test "returns the correct active users" do
      user_id = "abc123"

      user = %User{
        user_id: user_id,
        user_alias: "bronco"
      }

      UserCache.upsert_user(user)

      {:ok, _, _socket} =
        UserSocket
        |> socket()
        |> subscribe_and_join(UserChannel, "user:" <> user_id)

      res = Admin.list_active_users()
      assert res == [user]
    end

    test "returns empty list when no active users" do
      res = Admin.list_active_users()
      assert res == []
    end
  end
end
