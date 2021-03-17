defmodule MidimatchesWeb.UserChannel do
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

  def join("user:all", _params, socket) do
    {:ok, socket}
  end

  def join("user:" <> user_id, _params, socket) do
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
