defmodule Progressions.PidsTest do
  use ExUnit.Case, async: true

  alias Progressions.{
    Pids,
    Rooms
  }

  test "registers and returns supported pids" do
    room_ids = ["41231", "52323", "6123412"]

    reg_results = Enum.map(room_ids, &Pids.register({:room, &1}, fn _ -> nil end))
    get_results = Enum.map(room_ids, &Pids.fetch({:room, &1}))

    assert length(room_ids) == length(reg_results)
    assert length(room_ids) == length(get_results)

    Enum.each(reg_results, fn {:ok, pid} ->
      assert true == is_pid(pid)
    end)

    Enum.each(get_results, fn pid ->
      assert true == is_pid(pid)
    end)
  end

  test "returns nil for pid not found" do
    assert nil == Pids.fetch({:room, "928u902817482"})
  end

  # TODO more tests for different types
end
