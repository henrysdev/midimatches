defmodule Progressions.Pids do
  @moduledoc """
  Provides convenience functions for interacting with process registry layer
  """

  @proc_types [:room, :loop_server]

  @type registry_resp() :: {:ok, pid()} | {:error, String.t() | tuple()}
  @type id() :: String.t()
  @type registry_key() :: tuple()

  @doc """
  Registers a pid by a tuple key
  """
  @spec register(registry_key(), pid()) :: registry_resp()
  def register({proc_type, identifiers}, pid) when proc_type in @proc_types do
    Registry.register(ProcessRegistry, {proc_type, identifiers}, pid)
  end

  def register({proc_type, _ids}, _pid) do
    {:error, "cannot register unidentified process type #{proc_type}"}
  end

  @doc """
  Returns the pid value for the provided tuple key if one exists, otherwise nil
  """
  @spec fetch(registry_key()) :: pid()
  def fetch({proc_type, _ids} = key) when proc_type in @proc_types do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> nil
    end
  end

  @doc """
  Returns the pid value for the provided tuple key if one exists, otherwise
  a missing key error will be raised
  """
  @spec fetch!(registry_key()) :: pid()
  def fetch!({proc_type, _ids} = key) when proc_type in @proc_types do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> raise "Key not found in registry: #{inspect(key)}"
    end
  end
end
