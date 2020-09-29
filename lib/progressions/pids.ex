defmodule Progressions.Pids do
  @moduledoc """
  Provides convenience functions for interacting with process registry layer
  """

  @doc """
  Get pid of room process by room_id
  """
  @spec get_room(String.t()) :: pid()
  def get_room(id) do
    lookup("room_#{id}")
  end

  @doc """
  Register pid of room process by room_id
  """
  @spec register_room(String.t(), pid()) ::
          {:ok, pid()} | {:error, {:already_registered, pid()}}
  def register_room(id, pid) do
    Registry.register(ProcessRegistry, "room_#{id}", pid)
  end

  @spec lookup(String.t()) :: pid()
  defp lookup(key) do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> nil
    end
  end
end
