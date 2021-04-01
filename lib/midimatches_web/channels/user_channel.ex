defmodule MidimatchesWeb.UserChannel do
  @moduledoc """
  Channel for meta/site admin events that is available on every dynamic page of the application.
  This channel allows communication with any/all online users regardless of their url location.
  """
  use MidimatchesWeb, :channel

  alias Midimatches.Utils
  alias MidimatchesWeb.PresenceTracker

  require Logger

  intercept ["admin_message", "duplicate_session"]

  #################################################################################################
  ## Join Messages                                                                               ##
  #################################################################################################

  def join("user:all", _params, socket) do
    {:ok, socket}
  end

  def join("user:" <> user_id, _params, socket) do
    user_conns =
      PresenceTracker.get_tracked_conns()
      |> Enum.filter(fn {user, _meta} -> user == user_id end)

    join_id = Utils.gen_uuid()

    if length(user_conns) > 0 do
      send(self(), {:dedupe_user_conns, user_id, join_id})
    else
      :ok
      # PresenceTracker.track_conn(self(), user_id, %{join_time: :erlang.monotonic_time()})
    end

    PresenceTracker.track_conn(self(), user_id, %{
      user_id: user_id,
      join_time: :erlang.monotonic_time(),
      join_id: join_id
    })

    {:ok, socket |> assign(:last_join_id, join_id)}
  end

  def handle_info({:dedupe_user_conns, _user_id, join_id}, socket) do
    broadcast!(socket, "duplicate_session", %{last_join_id: join_id})
    {:noreply, socket}
  end

  #################################################################################################
  ## Outgoing Messages                                                                           ##
  #################################################################################################

  def handle_out("admin_message", msg, socket) do
    push(socket, "admin_message", msg)
    {:noreply, socket}
  end

  @doc """
  Pushes a duplicate session message to all user conns besides the most current, effectively
  enforcing a 1 browser tab policy. This helps to prevent
    1. Conflicting states
    2. Cheating
    3. Denial of Service
  """
  def handle_out("duplicate_session", %{last_join_id: last_join_id}, socket) do
    if Map.has_key?(socket.assigns, :last_join_id) and socket.assigns.last_join_id == last_join_id do
      {:noreply, socket}
    else
      push(socket, "duplicate_session", %{})
      {:noreply, socket}
    end
  end
end
