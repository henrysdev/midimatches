defmodule Progressions.UtilsTest do
  use ExUnit.Case

  alias Progressions.Utils

  describe "calc_deadline" do
    test "for a loop that has started" do
      loop_start_timestep = 2
      loop_length = 4

      deadlines =
        1..16
        |> Enum.map(&Utils.calc_deadline(&1, loop_start_timestep, loop_length))
        |> Enum.with_index()

      assert deadlines == [
               {2, 0},
               {6, 1},
               {6, 2},
               {6, 3},
               {6, 4},
               {10, 5},
               {10, 6},
               {10, 7},
               {10, 8},
               {14, 9},
               {14, 10},
               {14, 11},
               {14, 12},
               {18, 13},
               {18, 14},
               {18, 15}
             ]
    end

    test "for a loop that starts in future" do
      loop_start_timestep = 6
      loop_length = 5

      deadlines =
        0..20
        |> Enum.map(&Utils.calc_deadline(&1, loop_start_timestep, loop_length))
        |> Enum.with_index()

      assert deadlines == [
               {6, 0},
               {6, 1},
               {6, 2},
               {6, 3},
               {6, 4},
               {6, 5},
               {11, 6},
               {11, 7},
               {11, 8},
               {11, 9},
               {11, 10},
               {16, 11},
               {16, 12},
               {16, 13},
               {16, 14},
               {16, 15},
               {21, 16},
               {21, 17},
               {21, 18},
               {21, 19},
               {21, 20}
             ]
    end

    test "for loop with loop length 1" do
      loop_start_timestep = 4
      loop_length = 1

      deadlines =
        0..10
        |> Enum.map(&Utils.calc_deadline(&1, loop_start_timestep, loop_length))
        |> Enum.with_index()

      assert deadlines == [
               {4, 0},
               {4, 1},
               {4, 2},
               {4, 3},
               {5, 4},
               {6, 5},
               {7, 6},
               {8, 7},
               {9, 8},
               {10, 9},
               {11, 10}
             ]
    end

    test "for loop that starts at 0" do
      loop_start_timestep = 0
      loop_length = 1

      deadlines =
        0..10
        |> Enum.map(&Utils.calc_deadline(&1, loop_start_timestep, loop_length))
        |> Enum.with_index()

      assert deadlines == [
               {1, 0},
               {2, 1},
               {3, 2},
               {4, 3},
               {5, 4},
               {6, 5},
               {7, 6},
               {8, 7},
               {9, 8},
               {10, 9},
               {11, 10}
             ]
    end

    test "for loop with loop length 0 returns error" do
      loop_start_timestep = 0
      loop_length = 0

      result = Utils.calc_deadline(42, loop_start_timestep, loop_length)

      assert result == {:error, "loop length must be greater than zero"}
    end
  end
end
