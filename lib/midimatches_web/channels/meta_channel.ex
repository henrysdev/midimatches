defmodule MidimatchesWeb.MetaChannel do
  @moduledoc """
  Channel for meta/site admin events that is available on every dynamic page of the application.
  This channel allows communication with any/all online users regardless of their url location.
  """
  use MidimatchesWeb, :channel

  require Logger

  intercept ["admin_message"]

  #################################################################################################
  ## Join Messages                                                                               ##
  #################################################################################################

  def join("meta:common", _params, socket) do
    {:ok, socket}
  end

  #################################################################################################
  ## Outgoing Messages                                                                           ##
  #################################################################################################

  def handle_out("admin_message", msg, socket) do
    push(socket, "admin_message", msg)
    {:noreply, socket}
  end
end
