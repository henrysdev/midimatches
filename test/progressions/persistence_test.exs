defmodule Progressions.PersistenceTest do
  use ExUnit.Case

  alias Progressions.Persistence

  test "generates next 10 serial ids" do
    start = Persistence.gen_serial_id() + 1
    expected_serial_ids = start..(start + 10) |> Enum.to_list()

    serial_ids =
      for _ <- 0..10 |> Enum.to_list() do
        Persistence.gen_serial_id()
      end

    assert serial_ids == expected_serial_ids
  end
end
