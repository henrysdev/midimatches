defmodule MidimatchesWeb.MatchmakingChannel do
  @moduledoc """
  Exposes API for all websocket communication on servers page
  """
  alias Midimatches.Matchmaking
  use MidimatchesWeb, :channel

  require Logger

  intercept ["serverlist_update"]

  #################################################################################################
  ## Join Messages                                                                               ##
  #################################################################################################

  def join("matchmaking:serverlist", _params, socket) do
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

  #################################################################################################
  ## Outgoing Messages                                                                           ##
  #################################################################################################

  def handle_out("serverlist_update", msg, socket) do
    push(socket, "serverlist_update", msg)
    {:noreply, socket}
  end
end
