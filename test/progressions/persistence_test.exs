defmodule Progressions.PersistenceTest do
  use ExUnit.Case

  alias Progressions.Persistence

  test "generates serial pids starting from 1000" do
    expected_serial_ids = 1000..1010 |> Enum.to_list()

    serial_ids =
      for _ <- 0..10 |> Enum.to_list() do
        Persistence.gen_serial_id()
      end

    assert serial_ids == expected_serial_ids
  end
end
