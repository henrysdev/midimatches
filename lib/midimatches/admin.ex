defmodule Midimatches.Admin do
  @moduledoc """
  Provides set of convenience functions for administration of the application
  """

  alias Midimatches.Types.AdminMessage

  @spec broadcast_admin_message(String.t()) :: :ok
  def broadcast_admin_message(message) do
    MidimatchesWeb.Endpoint.broadcast(
      "meta:common",
      "admin_alert",
      %AdminMessage{message_text: message}
    )
  end
end
