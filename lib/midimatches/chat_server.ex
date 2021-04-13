defmodule Midimatches.ChatServer do
  @moduledoc """
  Server process that maintains state of a chat room
  """

  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Types.ChatMessage
  }

  require Logger

  @default_max_history_size 256

  typedstruct do
    field(:chat_msg_history, :queue.t(ChatMessage), default: :queue.new())
    field(:max_history_size, integer(), default: @default_max_history_size)
  end

  def start_link(args) do
    GenServer.start_link(ChatServer, args)
  end

  @impl true
  def init(args) do
    {id, max_history_size} =
      case args do
        [{id, max_history_size}] -> {id, max_history_size}
        [{id}] -> {id, @default_max_history_size}
      end

    Pids.register({:chat_server, id}, self())

    {:ok, %ChatServer{max_history_size: max_history_size}}
  end

  @spec incoming_chat_message(pid(), %ChatMessage{}) :: %ChatServer{}
  def incoming_chat_message(pid, %ChatMessage{} = chat_msg) do
    GenServer.call(pid, {:incoming_chat_message, chat_msg})
  end

  @spec chat_history(pid(), integer()) :: list(ChatMessage)
  def chat_history(pid, msg_count \\ @default_max_history_size) do
    GenServer.call(pid, {:chat_history, msg_count})
  end

  @impl true
  def handle_call(
        {:incoming_chat_message, chat_msg},
        _from,
        %ChatServer{
          chat_msg_history: chat_msg_history,
          max_history_size: max_history_size
        } = state
      ) do
    chat_msg_history =
      if :queue.len(chat_msg_history) == max_history_size do
        {_, chat_msg_history} = :queue.out(chat_msg_history)
        :queue.in(chat_msg, chat_msg_history)
      else
        :queue.in(chat_msg, chat_msg_history)
      end

    state = %ChatServer{state | chat_msg_history: chat_msg_history}
    {:reply, state, state}
  end

  @impl true
  def handle_call(
        {:chat_history, msg_count},
        _from,
        %ChatServer{
          chat_msg_history: chat_msg_history
        } = state
      ) do
    chat_msg_history_list =
      chat_msg_history
      |> :queue.to_list()
      |> Enum.reverse()
      |> Stream.take(msg_count)
      |> Enum.reverse()

    {:reply, chat_msg_history_list, state}
  end
end
