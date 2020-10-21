defmodule Progressions.TimestepClockTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Musicians,
    Rooms.Room.Server,
    Rooms.Room.TimestepClock,
    TestHelpers,
    Types.Configs.MusicianConfig,
    Types.Configs.TimestepClockConfig,
    Types.Loop,
    Types.Note,
    Types.TimestepSlice
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up timestep clock properly" do
    room_id = "1"
    timestep_us = 50_000
    tick_in_timesteps = 4

    timestep_clock_config = %TimestepClockConfig{
      timestep_us: timestep_us,
      tick_in_timesteps: tick_in_timesteps
    }

    {:ok, server} = start_supervised({Server, [room_id]})
    {:ok, musicians} = start_supervised({Musicians, [room_id]})
    {:ok, timestep_clock} = start_supervised({TimestepClock, [room_id, timestep_clock_config]})

    state = :sys.get_state(timestep_clock)

    assert %TimestepClock{
             last_time: _,
             musicians: musicians,
             room_id: room_id,
             server: server,
             tick_in_timesteps: tick_in_timesteps,
             timestep: 0,
             timestep_us: timestep_us
           } = state
  end

  test "simulates tick in timesteps for multiple musicians" do
    room_id = "1"
    timestep_us = 50_000
    tick_in_timesteps = 4

    # spoof extremely large timestep to allow for unit testing of callbacks
    # without interruption from internal timer
    timestep_clock_config = %TimestepClockConfig{
      timestep_us: 10_000_000_000,
      tick_in_timesteps: tick_in_timesteps
    }

    musicians_configs = [
      %MusicianConfig{
        loop: %Loop{
          start_timestep: 0,
          length: 4,
          timestep_slices: [
            %TimestepSlice{
              timestep: 0,
              notes: [
                %Note{
                  instrument: "A",
                  key: 12,
                  duration: 1
                }
              ]
            },
            %TimestepSlice{
              timestep: 1,
              notes: [
                %Note{
                  instrument: "B",
                  key: 14,
                  duration: 2
                }
              ]
            }
          ]
        }
      },
      %MusicianConfig{
        loop: %Loop{
          start_timestep: 0,
          length: 4,
          timestep_slices: [
            %TimestepSlice{
              timestep: 2,
              notes: [
                %Note{
                  instrument: "A1",
                  key: 12,
                  duration: 1
                }
              ]
            },
            %TimestepSlice{
              timestep: 3,
              notes: [
                %Note{
                  instrument: "B1",
                  key: 14,
                  duration: 2
                }
              ]
            }
          ]
        }
      }
    ]

    {:ok, server} = start_supervised({Server, [room_id]})
    {:ok, musicians} = start_supervised({Musicians, [room_id]})
    :ok = Musicians.configure_musicians(musicians_configs, room_id)
    {:ok, timestep_clock} = start_supervised({TimestepClock, [room_id, timestep_clock_config]})

    current_timestep = 0

    logs =
      simulate_timesteps(
        timestep_clock,
        server,
        musicians,
        current_timestep,
        tick_in_timesteps,
        timestep_us
      )

    assert [
             %{
               musicians: [
                 %{
                   deadline: 4,
                   last_timestep: 0,
                   loop_left:
                     {[],
                      [
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 2, instrument: "B", key: 14}
                          ],
                          timestep: 1
                        }
                      ]}
                 },
                 %{
                   deadline: 4,
                   last_timestep: 0,
                   loop_left:
                     {[
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 2, instrument: "B1", key: 14}
                          ],
                          timestep: 3
                        }
                      ],
                      [
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 1, instrument: "A1", key: 12}
                          ],
                          timestep: 2
                        }
                      ]}
                 }
               ],
               server: %{
                 buffered_timestep_slices: [
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A", key: 12}
                     ],
                     timestep: 0
                   }
                 ]
               },
               timestep_clock: %{timestep: 1}
             },
             %{
               musicians: [
                 %{deadline: 4, last_timestep: 1, loop_left: {[], []}},
                 %{
                   deadline: 4,
                   last_timestep: 1,
                   loop_left:
                     {[
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 2, instrument: "B1", key: 14}
                          ],
                          timestep: 3
                        }
                      ],
                      [
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 1, instrument: "A1", key: 12}
                          ],
                          timestep: 2
                        }
                      ]}
                 }
               ],
               server: %{
                 buffered_timestep_slices: [
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A", key: 12}
                     ],
                     timestep: 0
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 2, instrument: "B", key: 14}
                     ],
                     timestep: 1
                   }
                 ]
               },
               timestep_clock: %{timestep: 2}
             },
             %{
               musicians: [
                 %{deadline: 4, last_timestep: 2, loop_left: {[], []}},
                 %{
                   deadline: 4,
                   last_timestep: 2,
                   loop_left:
                     {[],
                      [
                        %Progressions.Types.TimestepSlice{
                          notes: [
                            %Progressions.Types.Note{duration: 2, instrument: "B1", key: 14}
                          ],
                          timestep: 3
                        }
                      ]}
                 }
               ],
               server: %{
                 buffered_timestep_slices: [
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A", key: 12}
                     ],
                     timestep: 0
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 2, instrument: "B", key: 14}
                     ],
                     timestep: 1
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A1", key: 12}
                     ],
                     timestep: 2
                   }
                 ]
               },
               timestep_clock: %{timestep: 3}
             },
             %{
               musicians: [
                 %{deadline: 4, last_timestep: 3, loop_left: {[], []}},
                 %{deadline: 4, last_timestep: 3, loop_left: {[], []}}
               ],
               server: %{
                 buffered_timestep_slices: [
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A", key: 12}
                     ],
                     timestep: 0
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 2, instrument: "B", key: 14}
                     ],
                     timestep: 1
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 1, instrument: "A1", key: 12}
                     ],
                     timestep: 2
                   },
                   %Progressions.Types.TimestepSlice{
                     notes: [
                       %Progressions.Types.Note{duration: 2, instrument: "B1", key: 14}
                     ],
                     timestep: 3
                   }
                 ]
               },
               timestep_clock: %{timestep: 4}
             }
           ] = logs
  end

  defp inspect_clock_state(timestep_clock) do
    state = :sys.get_state(timestep_clock)
    %{timestep: state.timestep}
  end

  defp inspect_server_state(server) do
    state = :sys.get_state(server)
    %{buffered_timestep_slices: state.timestep_slices}
  end

  defp inspect_musicians_state(musicians) do
    Musicians.list_musicians(musicians)
    |> Enum.map(&elem(&1, 1))
    |> Enum.map(fn musician ->
      state = :sys.get_state(musician)

      %{
        last_timestep: state.last_timestep,
        deadline: elem(state.playhead, 0),
        loop_left: elem(state.playhead, 1)
      }
    end)
  end

  defp simulate_timesteps(
         timestep_clock,
         server,
         musicians,
         current_timestep,
         num_timesteps,
         timestep_us
       ) do
    end_timestep = current_timestep + num_timesteps - 1

    Enum.map(current_timestep..end_timestep, fn _ ->
      send(timestep_clock, :increment_timestep)
      :timer.sleep(trunc(0.001 * timestep_us))

      %{
        timestep_clock: inspect_clock_state(timestep_clock),
        server: inspect_server_state(server),
        musicians: inspect_musicians_state(musicians)
      }
    end)
  end
end
