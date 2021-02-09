defmodule ProgressionsWeb.ServerlistChannel do
  @moduledoc """
  Exposes API for all websocket communication on servers page
  """
  alias Progressions.Matchmaking
  use ProgressionsWeb, :channel

  require Logger

  intercept ["serverlist_update"]

  def handle_out("serverlist_update", msg, socket) do
    push(socket, "serverlist_update", msg)
    {:noreply, socket}
  end

  def join("servers:serverlist", _params, socket) do
    send(self(), {:init_serverlist})
    {:ok, socket}
  end

  def handle_info({:init_serverlist}, socket) do
    room_states = Matchmaking.get_rooms_list()

    PresenceTracker.track_conn(self(), "serverlist_update")

    push(socket, "serverlist_update", %{
      rooms: room_states
    })

    {:noreply, socket}
  end
end
