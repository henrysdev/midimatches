defmodule ProgressionsWeb.RoomChannel do
  @moduledoc """
  Exposes API for all websocket communication in rooms
  """

  use Phoenix.Channel

  alias Progressions.{
    Persistence,
    Pids,
    Rooms,
    Rooms.Room.ServerAPI,
    Types.Loop,
    Types.Musician,
    Types.Note,
    Types.TimestepSlice
  }

  # TODO move to type decode helper
  @loop_schema %Loop{
    length: nil,
    start_timestep: nil,
    timestep_slices: [
      %TimestepSlice{
        notes: [
          %Note{
            duration: nil,
            instrument: nil,
            key: nil
          }
        ],
        timestep: nil
      }
    ]
  }

  def join("room:" <> room_id, _params, socket) do
    if Rooms.room_exists?(room_id) do
      send(self(), "init_room_client")

      {:ok,
       socket
       |> assign(room_id: room_id)}
    else
      {:error, "room #{room_id} does not exist"}
    end
  end

  def handle_info("init_room_client", %{assigns: %{room_id: room_id}} = socket) do
    room_server = Pids.fetch!({:server, room_id})
    musician_id = Persistence.gen_serial_id()

    ServerAPI.add_musician(room_server, %Musician{
      musician_id: musician_id
    })

    start_time_utc = ServerAPI.get_start_time(room_server)
    push(socket, "init_room_client", %{start_time_utc: start_time_utc})

    {:noreply,
     socket
     |> assign(room_server: room_server)
     |> assign(musician_id: musician_id)}
  end

  def handle_in(
        "update_musician_loop",
        %{"loop" => loop_json},
        %Phoenix.Socket{assigns: %{room_server: room_server, musician_id: musician_id}} = socket
      ) do
    {:ok, loop} = Poison.decode(loop_json, as: @loop_schema)

    ServerAPI.update_musician_loop(room_server, musician_id, loop)

    {:noreply, socket}
  end

  # @doc """
  # Event denoting a client readying up
  # """
  # def handle_in("ready_up", params, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Broadcast to clients to render recording view
  # """
  # def handle_out("set_game_view", %{view: "RECORDING"}, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Event denoting a client submitting a recording
  # """
  # def handle_in("submit_recording", params, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Broadcast to clients to render playback voting view
  # """
  # def handle_out("set_game_view", %{view: "PLAYBACK_VOTING"}, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Event denoting a client submitting a vote
  # """
  # def handle_in("submit_vote", params, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Broadcast to clients to render round results view
  # """
  # def handle_out("set_game_view", %{view: "ROUND_RESULTS"}, socket) do
  #   {:noreply, socket}
  # end

  # @doc """
  # Broadcast to clients to render game results view
  # """
  # def handle_out("set_game_view", %{view: "GAME_RESULTS"}, socket) do
  #   {:noreply, socket}
  # end
end
