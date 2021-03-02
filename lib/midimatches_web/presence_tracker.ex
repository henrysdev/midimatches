defmodule MidimatchesWeb.PresenceTracker do
  @moduledoc """
  A presence tracking process for detecting when client connections should
  be dropped.
  """

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Rooms.RoomServer
  }

  require Logger

  use Phoenix.Tracker

  def start_link(opts) do
    opts = Keyword.merge([name: PresenceTracker], opts)
    Phoenix.Tracker.start_link(PresenceTracker, opts, opts)
  end

  @impl true
  def init(opts) do
    server = Keyword.fetch!(opts, :pubsub_server)
    {:ok, %{pubsub_server: server, node_name: Phoenix.PubSub.node_name(server)}}
  end

  @impl true
  def handle_diff(diff, state) do
    for {topic, {joins, leaves}} <- diff do
      for {key, meta} <- joins do
        msg = {:join, key, meta}
        Phoenix.PubSub.direct_broadcast!(state.node_name, state.pubsub_server, topic, msg)
      end

      for {player_id, %{topic: "room: " <> room_id} = meta} <- leaves do
        room_server = Pids.fetch({:room_server, room_id})

        if is_nil(room_server) do
          :ok
        else
          Logger.warn("Presence tracker dropping player_id #{player_id} from room_id #{room_id}")
          RoomServer.drop_player(room_server, player_id)
        end

        msg = {:leave, player_id, meta}
        Phoenix.PubSub.direct_broadcast!(state.node_name, state.pubsub_server, topic, msg)
      end
    end

    {:ok, state}
  end

  @doc """
  Track a websocket connection
  """
  def track_conn(pid, user_id, topic) do
    Phoenix.Tracker.track(PresenceTracker, pid, topic, user_id, %{topic: topic, stat: "away"})
  end
end
