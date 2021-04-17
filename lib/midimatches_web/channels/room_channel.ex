defmodule MidimatchesWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use MidimatchesWeb, :channel

  alias Midimatches.{
    ChatServer,
    Pids,
    ProfanityFilter,
    Rooms,
    Rooms.Room.GameInstance,
    Rooms.RoomServer,
    Types.ChatMessage,
    Types.Loop,
    Types.Note,
    Types.Player,
    Types.TimestepSlice,
    UserCache,
    Utils
  }

  require Logger

  @loop_schema %Loop{
    length: nil,
    start_timestep: nil,
    timestep_slices: [
      %TimestepSlice{
        notes: [
          %Note{
            duration: nil,
            key: nil,
            velocity: nil
          }
        ],
        timestep: nil
      }
    ]
  }

  intercept ["lobby_update", "start_game", "game_update", "reset_room"]

  #################################################################################################
  ## Join Messages                                                                               ##
  #################################################################################################

  def join(
        "room:" <> room_id,
        %{"user_id" => user_id},
        socket
      ) do
    if Rooms.room_exists?(room_id) do
      room_server = Pids.fetch!({:room_server, room_id})
      chat_server = Pids.fetch!({:chat_server, room_id})
      send(self(), {:init_conn, room_id, chat_server})

      if UserCache.user_id_exists?(user_id) do
        player =
          user_id
          |> UserCache.get_user_by_id()
          |> Utils.user_to_player()

        {:ok,
         socket
         |> assign(room_id: room_id)
         |> assign(room_server: room_server)
         |> assign(player_id: player.player_id)
         |> assign(chat_server: chat_server)
         |> assign_game_server()}
      else
        {:error, "cannot join, no user found for user_id=#{user_id}"}
      end
    else
      {:error, "cannot join, room does not exist for room_id=#{room_id}"}
    end
  end

  def handle_info({:init_conn, room_id, chat_server}, socket) do
    Pids.fetch!({:room_server, room_id})
    |> RoomServer.sync_lobby_state()

    chat_history = ChatServer.chat_history(chat_server)

    push(socket, "new_chat_messages", %{chat_messages: chat_history})

    {:noreply, socket}
  end

  #################################################################################################
  ## Incoming Messages                                                                           ##
  #################################################################################################

  def handle_in(
        "player_join",
        %{
          "player_alias" => player_alias,
          "player_id" => player_id,
          "is_audience_member" => audience_member?
        },
        %Phoenix.Socket{assigns: %{room_id: room_id, player_id: player_id}} = socket
      ) do
    room_server = Pids.fetch!({:room_server, room_id})

    player = %Player{
      player_id: player_id,
      player_alias: player_alias
    }

    room_state =
      if audience_member? do
        RoomServer.add_audience_member(room_server, player)
      else
        RoomServer.add_player(room_server, player)
      end

    payload = Utils.server_room_to_client_room_game_join(room_state)

    {:reply, {:ok, payload},
     socket |> assign_game_server() |> assign(audience_member?: audience_member?)}
  end

  def handle_in(
        "player_leave_room",
        _params,
        %Phoenix.Socket{assigns: %{room_server: room_server, player_id: player_id}} = socket
      ) do
    RoomServer.drop_player(room_server, player_id)

    {:noreply, socket}
  end

  def handle_in(
        "player_ready_up",
        _params,
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    GameInstance.client_event(game_server, {:ready_up, player_id})

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(
        "player_recording",
        %{"recording" => loop_json},
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    {:ok, recording} = Poison.decode(loop_json, as: @loop_schema)

    GameInstance.client_event(game_server, {:record, {player_id, recording}})

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(
        "player_vote",
        %{"vote" => vote},
        %Phoenix.Socket{assigns: %{game_server: game_server, player_id: player_id}} = socket
      ) do
    GameInstance.client_event(game_server, {:vote, {player_id, vote}})

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(
        "player_chat_message",
        %{"message_text" => message_text},
        %Phoenix.Socket{
          assigns: %{
            player_id: player_id,
            audience_member?: audience_member?,
            chat_server: chat_server
          }
        } = socket
      ) do
    player =
      player_id
      |> UserCache.get_user_by_id()
      |> Utils.user_to_player()

    chat_message = %ChatMessage{
      sender_id: player_id,
      is_audience_member: audience_member?,
      sender_alias: player.player_alias,
      message_text: ProfanityFilter.sanitize(message_text),
      timestamp: Utils.curr_utc_timestamp()
    }

    ChatServer.incoming_chat_message(chat_server, chat_message)

    broadcast!(socket, "new_chat_messages", %{chat_messages: [chat_message]})

    {:reply, {:ok, %{}}, socket}
  end

  def handle_in(event, params, socket) do
    Logger.warn(
      "Unexpected websocket event. " <>
        "type=#{event} " <>
        "params=#{inspect(params)} " <>
        "socket.assigns=#{inspect(socket.assigns)} "
    )

    {:noreply, socket}
  end

  #################################################################################################
  ## Outgoing Messages                                                                           ##
  #################################################################################################

  def handle_out("lobby_update", msg, socket) do
    push(socket, "lobby_update", msg)
    {:noreply, socket}
  end

  def handle_out("game_update", msg, socket) do
    push(socket, "game_update", msg)
    {:noreply, socket}
  end

  def handle_out("start_game", msg, %Phoenix.Socket{assigns: %{room_id: room_id}} = socket) do
    push(socket, "start_game", msg)
    game_server = Pids.fetch!({:game_server, room_id})
    {:noreply, socket |> assign(game_server: game_server)}
  end

  def handle_out("reset_room", msg, %Phoenix.Socket{} = socket) do
    push(socket, "reset_room", msg)
    {:noreply, socket}
  end

  #################################################################################################
  ## Helpers                                                                                     ##
  #################################################################################################

  @spec assign_game_server(%Phoenix.Socket{}) :: %Phoenix.Socket{}
  defp assign_game_server(%Phoenix.Socket{assigns: %{room_id: room_id}} = socket) do
    game_server = Pids.fetch({:game_server, room_id})
    chat_server = Pids.fetch({:chat_server, room_id})

    if is_nil(game_server) do
      socket
    else
      socket
      |> assign(game_server: game_server)
      |> assign(chat_server: chat_server)
    end
  end
end
