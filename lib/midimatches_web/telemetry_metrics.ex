defmodule MidimatchesWeb.TelemetryMetrics do
  @moduledoc """
  Functions for observability use cases such as metrics and data reporting.
  """

  require Logger

  alias MidimatchesWeb.PresenceTracker

  def num_active_user_sessions do
    num_sessions = PresenceTracker.get_tracked_conns() |> length()

    Logger.info("num_active_user_sessions=#{num_sessions}")
    # :telemetry.execute([:midimatches, :users], %{total: num_sessions}, %{})
  end
end
