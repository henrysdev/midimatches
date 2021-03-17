defmodule Midimatches.Admin do
  @moduledoc """
  Provides set of convenience functions for administration of the application
  """

  alias Midimatches.Types.AdminMessage

  @spec broadcast_admin_message(String.t()) :: :ok
  @doc """
  Broadcast an alert message to all connected players
  """
  def broadcast_admin_message(message) do
    MidimatchesWeb.Endpoint.broadcast(
      "meta:common",
      "admin_alert",
      %{admin_message: %AdminMessage{message_text: message}}
    )
  end
end
