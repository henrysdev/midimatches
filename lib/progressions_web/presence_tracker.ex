defmodule ProgressionsWeb.PresenceTracker do
  @moduledoc """
  A presence tracking process for detecting when client connections should
  be dropped.
  """

  alias __MODULE__
  alias Progressions.Utils

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

      for {key, meta} <- leaves do
        msg = {:leave, key, meta}
        Phoenix.PubSub.direct_broadcast!(state.node_name, state.pubsub_server, topic, msg)
      end
    end

    {:ok, state}
  end

  @doc """
  Track a websocket connection
  """
  def track_conn(pid, topic) do
    uuid = Utils.gen_uuid()
    Phoenix.Tracker.track(PresenceTracker, pid, topic, uuid, %{topic: topic, stat: "away"})
  end
end
