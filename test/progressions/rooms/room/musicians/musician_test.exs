defmodule Progressions.MusicianTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Musicians.Musician,
    Rooms.Room.Server,
    TestHelpers,
    Types.Configs.MusicianConfig,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  describe "musician callbacks" do
    setup do
      TestHelpers.teardown_rooms()
      on_exit(fn -> TestHelpers.teardown_rooms() end)
    end

    test "next_timestep works with loops properly" do
      musician_config = %MusicianConfig{
        loop: %Loop{
          start_timestep: 2,
          length: 4,
          timestep_slices: [
            %TimestepSlice{
              timestep: 0,
              notes: [
                %Note{
                  instrument: "A",
                  key: 42,
                  duration: 1
                }
              ]
            },
            %TimestepSlice{
              timestep: 1,
              notes: [
                %Note{
                  instrument: "B",
                  key: 42,
                  duration: 1
                }
              ]
            },
            %TimestepSlice{
              timestep: 2,
              notes: [
                %Note{
                  instrument: "C",
                  key: 42,
                  duration: 1
                }
              ]
            },
            %TimestepSlice{
              timestep: 3,
              notes: [
                %Note{
                  instrument: "D",
                  key: 42,
                  duration: 1
                }
              ]
            }
          ]
        }
      }

      room_id = "1"
      musician_id = "2"

      {:ok, server} = start_supervised({Server, [room_id]})
      {:ok, musician} = start_supervised({Musician, [room_id, musician_id, musician_config]})

      logs =
        Enum.reduce(0..7, [], fn curr_timestep, acc ->
          Musician.next_timestep(musician, curr_timestep)
          musician_state = inspect_musician_state(musician)
          server_state = inspect_server_state(server)
          [{musician_state, server_state} | acc]
        end)
        |> Enum.reverse()

      assert [
               {%{deadline: 2, last_timestep: 0, loop_left: {[], []}}, %{timestep_slices: []}},
               {%{deadline: 2, last_timestep: 1, loop_left: {[], []}}, %{timestep_slices: []}},
               {%{
                  deadline: 6,
                  last_timestep: 2,
                  loop_left:
                    {[
                       %TimestepSlice{notes: _, timestep: 5},
                       %TimestepSlice{notes: _, timestep: 4}
                     ], [%TimestepSlice{notes: _, timestep: 3}]}
                }, %{timestep_slices: [%TimestepSlice{notes: _, timestep: 2}]}},
               {%{
                  deadline: 6,
                  last_timestep: 3,
                  loop_left:
                    {[%TimestepSlice{notes: _, timestep: 5}],
                     [%TimestepSlice{notes: _, timestep: 4}]}
                },
                %{
                  timestep_slices: [
                    %TimestepSlice{notes: _, timestep: 2},
                    %TimestepSlice{notes: _, timestep: 3}
                  ]
                }},
               {%{
                  deadline: 6,
                  last_timestep: 4,
                  loop_left: {[], [%TimestepSlice{notes: _, timestep: 5}]}
                },
                %{
                  timestep_slices: [
                    %TimestepSlice{notes: _, timestep: 2},
                    %TimestepSlice{notes: _, timestep: 3},
                    %TimestepSlice{notes: _, timestep: 4}
                  ]
                }},
               {%{deadline: 6, last_timestep: 5, loop_left: {[], []}},
                %{
                  timestep_slices: [
                    %TimestepSlice{notes: _, timestep: 2},
                    %TimestepSlice{notes: _, timestep: 3},
                    %TimestepSlice{notes: _, timestep: 4},
                    %TimestepSlice{notes: _, timestep: 5}
                  ]
                }},
               {%{
                  deadline: 10,
                  last_timestep: 6,
                  loop_left:
                    {[
                       %TimestepSlice{notes: _, timestep: 9},
                       %TimestepSlice{notes: _, timestep: 8}
                     ], [%TimestepSlice{notes: _, timestep: 7}]}
                },
                %{
                  timestep_slices: [
                    %TimestepSlice{notes: _, timestep: 2},
                    %TimestepSlice{notes: _, timestep: 3},
                    %TimestepSlice{notes: _, timestep: 4},
                    %TimestepSlice{notes: _, timestep: 5},
                    %TimestepSlice{notes: _, timestep: 6}
                  ]
                }},
               {%{
                  deadline: 10,
                  last_timestep: 7,
                  loop_left:
                    {[
                       %TimestepSlice{notes: _, timestep: 9}
                     ], [%TimestepSlice{notes: _, timestep: 8}]}
                },
                %{
                  timestep_slices: [
                    %TimestepSlice{notes: _, timestep: 2},
                    %TimestepSlice{notes: _, timestep: 3},
                    %TimestepSlice{notes: _, timestep: 4},
                    %TimestepSlice{notes: _, timestep: 5},
                    %TimestepSlice{notes: _, timestep: 6},
                    %TimestepSlice{notes: _, timestep: 7}
                  ]
                }}
             ] = logs
    end
  end

  describe "calc_deadline" do
    test "for a loop that has started" do
      loop_start_timestep = 2
      loop_length = 4

      deadlines =
        1..16
        |> Enum.map(&Musician.calc_deadline(&1, loop_start_timestep, loop_length))
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
        |> Enum.map(&Musician.calc_deadline(&1, loop_start_timestep, loop_length))
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
        |> Enum.map(&Musician.calc_deadline(&1, loop_start_timestep, loop_length))
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
        |> Enum.map(&Musician.calc_deadline(&1, loop_start_timestep, loop_length))
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

      result = Musician.calc_deadline(42, loop_start_timestep, loop_length)

      assert result == {:error, "loop length must be greater than zero"}
    end
  end

  defp inspect_musician_state(musician) do
    state = :sys.get_state(musician)

    %{
      last_timestep: state.last_timestep,
      deadline: elem(state.playhead, 0),
      loop_left: elem(state.playhead, 1)
    }
  end

  defp inspect_server_state(server) do
    state = :sys.get_state(server)

    %{
      timestep_slices: state.timestep_slices
    }
  end
end
