defmodule Progressions.Pids do
  def get_room(id) do
    lookup("room_#{id}")
  end

  def get_instrument(id) do
    lookup("instrument_#{id}")
  end

  def register_room(id, pid) do
    Registry.register(ProcessRegistry, "room_#{id}", pid)
  end

  # Private methods
  defp lookup(key) do
    case Registry.lookup(ProcessRegistry, key) do
      [{pid, _} | _rest] -> pid
      _ -> nil
    end
  end
end
