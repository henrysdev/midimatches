defmodule Progressions.PidsTest do
  use ExUnit.Case

  alias Progressions.Pids

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

  test "only accepts supported process types and id formats" do
    results =
      [:room, :server, :timestep_clock, :musicians]
      |> Enum.map(fn a -> {a, "1"} end)
      |> Enum.map(&Pids.register(&1, spawn(fn -> nil end)))

    Enum.each(results, fn res -> assert {:ok, _} = res end)

    Registry.keys(ProcessRegistry, self())
  end

  # setup do
  #   reset_registry()
  #   on_exit(fn -> reset_registry() end)
  # end

  # defp reset_registry() do
  #   case Registry.keys(ProcessRegistry, self()) do
  #     [] ->
  #       :ok

  #     children ->
  #       children
  #       |> Enum.reduce(fn children, acc ->
  #         case children do
  #           {_, pid, _, _} ->
  #             keys = Registry.keys(ProcessRegistry, pid)
  #             IO.inspect({:KEYS, keys})
  #             [keys | acc]

  #           [] ->
  #             acc
  #         end
  #       end)
  #       |> Enum.map(&Registry.unregister(ProcessRegistry, &1))
  #   end
  # end
end
