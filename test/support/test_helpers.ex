defmodule Progressions.TestHelpers do
  @moduledoc """
  This module provides convenience methods for writing unit tests for this project
  """

  alias Progressions.Rooms

  def teardown_rooms do
    pids = room_pids()

    Enum.each(pids, &DynamicSupervisor.terminate_child(Rooms, &1))

    unregister_keys(pids)
  end

  defp room_pids do
    Rooms.list_rooms()
    |> Enum.map(fn {_, pid, _, _} -> pid end)
  end

  defp unregister_keys(pids) do
    pids
    |> Enum.reduce([], fn pid, acc ->
      keys = Registry.keys(ProcessRegistry, pid)
      keys ++ acc
    end)
    |> Enum.each(&Registry.unregister(ProcessRegistry, &1))
  end
end
