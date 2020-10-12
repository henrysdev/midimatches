defmodule Progressions.TestHelpers do
  @moduledoc """
  This module provides convenience methods for writing unit tests for this project
  """

  alias Progressions.{
    Rooms,
    Telemetry.EventLog
  }

  def teardown_rooms do
    Rooms.list_rooms()
    |> Enum.map(fn {_, pid, _, _} -> pid end)
    |> Enum.each(&DynamicSupervisor.terminate_child(Rooms, &1))

    EventLog.clear()
  end
end
