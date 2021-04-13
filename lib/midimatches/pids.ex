defmodule Midimatches.Pids do
  @moduledoc """
  Provides convenience functions for interacting with process registry layer
  """

  require Logger

  @proc_types [
    :room_supervisor,
    :room_server,
    :game_supervisor,
    :game_server,
    :view_timer,
    :chat_server
  ]

  @type registry_resp() :: {:ok, pid()} | {:error, String.t() | tuple()}
  @type id() :: String.t()
  @type registry_key() :: tuple()

  @spec register(registry_key(), pid()) :: registry_resp()
  @doc """
  Registers a pid by a tuple key
  """
  def register({proc_type, identifiers}, pid) when proc_type in @proc_types do
    Logger.info("registering_process #{proc_type} #{identifiers}")
    Registry.register(ProcessRegistry, {proc_type, identifiers}, pid)
  end

  def register({proc_type, _ids}, _pid) do
    {:error, "cannot register unidentified process type #{proc_type}"}
  end

  @spec fetch(registry_key()) :: pid() | nil
  @doc """
  Returns the pid value for the provided tuple key if one exists, otherwise nil
  """
  def fetch({proc_type, _ids} = key) when proc_type in @proc_types do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> nil
    end
  end

  @spec fetch!(registry_key()) :: pid()
  @doc """
  Returns the pid value for the provided tuple key if one exists, otherwise
  a missing key error will be raised
  """
  def fetch!({proc_type, _ids} = key) when proc_type in @proc_types do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> raise "Key not found in registry: #{inspect(key)}"
    end
  end
end
