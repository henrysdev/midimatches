defmodule Midimatches.ChatServerTest do
  use ExUnit.Case

  alias Midimatches.{
    ChatServer,
    Types.ChatMessage
  }

  test "chat server adds incoming messages to chat history properly" do
    example_msg = %ChatMessage{
      sender_id: "abc123",
      sender_alias: "ooga",
      is_audience_member: false,
      timestamp: 111,
      message_text: "hello all!"
    }

    incoming_chat_msgs = for _ <- 1..4, do: example_msg

    message_capacity = 3

    {:ok, chat_server} = start_supervised({ChatServer, [{"123", message_capacity}]})

    state_scan =
      Enum.map(incoming_chat_msgs, fn incoming_chat ->
        ChatServer.incoming_chat_message(chat_server, incoming_chat).chat_msg_history
        |> :queue.len()
      end)

    expected_state_scan = [1, 2, 3, 3]

    assert state_scan == expected_state_scan
  end

  describe "chat history" do
    test "returns all history by default" do
      incoming_chat_msgs = [
        %ChatMessage{
          sender_id: "abc123",
          sender_alias: "ooga",
          is_audience_member: false,
          timestamp: 111,
          message_text: "hello all!"
        },
        %ChatMessage{
          sender_id: "def123",
          sender_alias: "oobbga",
          is_audience_member: false,
          timestamp: 121,
          message_text: "heasllo all!"
        },
        %ChatMessage{
          sender_id: "ghi123",
          sender_alias: "ooaabbga",
          is_audience_member: false,
          timestamp: 131,
          message_text: "h11easllo all!"
        },
        %ChatMessage{
          sender_id: "jkl123",
          sender_alias: "yoobbga",
          is_audience_member: false,
          timestamp: 141,
          message_text: "another message"
        }
      ]

      {:ok, chat_server} = start_supervised({ChatServer, [{"123"}]})

      Enum.each(incoming_chat_msgs, fn incoming_chat ->
        ChatServer.incoming_chat_message(chat_server, incoming_chat).chat_msg_history
      end)

      actual_chat_history = ChatServer.chat_history(chat_server)

      expected_chat_history = incoming_chat_msgs

      assert actual_chat_history == expected_chat_history
    end

    test "returns n specified last messages" do
      incoming_chat_msgs = [
        %ChatMessage{
          sender_id: "abc123",
          sender_alias: "ooga",
          is_audience_member: false,
          timestamp: 111,
          message_text: "hello all!"
        },
        %ChatMessage{
          sender_id: "def123",
          sender_alias: "oobbga",
          is_audience_member: false,
          timestamp: 121,
          message_text: "heasllo all!"
        },
        %ChatMessage{
          sender_id: "ghi123",
          sender_alias: "ooaabbga",
          is_audience_member: false,
          timestamp: 131,
          message_text: "h11easllo all!"
        },
        %ChatMessage{
          sender_id: "jkl123",
          sender_alias: "yoobbga",
          is_audience_member: false,
          timestamp: 141,
          message_text: "another message"
        }
      ]

      {:ok, chat_server} = start_supervised({ChatServer, [{"123"}]})

      Enum.each(incoming_chat_msgs, fn incoming_chat ->
        ChatServer.incoming_chat_message(chat_server, incoming_chat).chat_msg_history
      end)

      actual_chat_history = ChatServer.chat_history(chat_server, 2)

      expected_chat_history = [
        %ChatMessage{
          sender_id: "ghi123",
          sender_alias: "ooaabbga",
          is_audience_member: false,
          timestamp: 131,
          message_text: "h11easllo all!"
        },
        %ChatMessage{
          sender_id: "jkl123",
          sender_alias: "yoobbga",
          is_audience_member: false,
          timestamp: 141,
          message_text: "another message"
        }
      ]

      assert actual_chat_history == expected_chat_history
    end
  end

  describe "clear chat history" do
    test "clears all history" do
      {:ok, chat_server} = start_supervised({ChatServer, [{"123"}]})

      :sys.replace_state(chat_server, fn state ->
        %ChatServer{
          state
          | chat_msg_history:
              :queue.from_list([
                %ChatMessage{
                  sender_id: "abc123",
                  sender_alias: "ooga",
                  is_audience_member: false,
                  timestamp: 111,
                  message_text: "hello all!"
                },
                %ChatMessage{
                  sender_id: "def123",
                  sender_alias: "oobbga",
                  is_audience_member: false,
                  timestamp: 121,
                  message_text: "heasllo all!"
                },
                %ChatMessage{
                  sender_id: "ghi123",
                  sender_alias: "ooaabbga",
                  is_audience_member: false,
                  timestamp: 131,
                  message_text: "h11easllo all!"
                }
              ])
        }
      end)

      ChatServer.clear_chat_history(chat_server)

      assert ChatServer.chat_history(chat_server) == []
    end
  end
end
