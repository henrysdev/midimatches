defmodule Midimatches.Admin do
  @moduledoc """
  Provides set of convenience functions for administration of the application
  """

  alias Midimatches.{
    Types.AdminMessage,
    Types.User,
    UserCache
  }

  alias MidimatchesWeb.PresenceTracker

  @type id() :: String.t()

  @spec alert_all_users(any, any) :: :ok | {:error, any}
  @doc """
  Broadcast an alert message to all connected players
  """
  def alert_all_users(message, alert_lifetime \\ nil) do
    handle_alert_broadcast("user:all", message, alert_lifetime)
  end

  @spec alert_user(any, any, any) :: :ok | {:error, any}
  @doc """
  Send an alert message to a specific user
  """
  def alert_user(user_id, message, alert_lifetime \\ nil) do
    handle_alert_broadcast("user:#{user_id}", message, alert_lifetime)
  end

  @spec list_active_users() :: list(User)
  @doc """
  Get a list of all currently active users
  """
  def list_active_users do
    PresenceTracker.get_tracked_conns()
    |> Enum.map(fn {user_id, _meta} -> UserCache.get_user_by_id(user_id) end)
    |> Enum.reject(&is_nil(&1))
  end

  defp handle_alert_broadcast(topic, message, alert_lifetime) do
    admin_message =
      if is_nil(alert_lifetime) do
        %AdminMessage{message_text: message}
      else
        %AdminMessage{message_text: message, alert_lifetime: alert_lifetime}
      end

    MidimatchesWeb.Endpoint.broadcast(
      topic,
      "admin_alert",
      %{admin_message: admin_message}
    )
  end
end
