defmodule Midimatches do
  @moduledoc """
  Midimatches keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  alias MidimatchesWeb.PresenceTracker

  def num_active_user_sessions do
    num_sessions = PresenceTracker.get_tracked_conns() |> length()
    :telemetry.execute([:midimatches, :user_sessions], %{total: num_sessions}, %{})
  end
end
