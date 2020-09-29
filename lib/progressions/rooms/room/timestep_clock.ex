defmodule Progressions.Rooms.Room.TimestepClock do
  @moduledoc """
  Clock process that facilitates timestep events within a room 
  """
  use GenServer

  alias Progressions.{Telemetry}

  @type clock_state() :: %{
          timer: pid(),
          steps: integer(),
          server: pid(),
          last_time: integer()
        }

  # TODO propagate these down via config
  @timestep_µs 50_000
  @measure_in_timesteps 8
  @tick_in_timesteps 4

  alias Progressions.{
    Pids,
    Rooms.Room.Server
  }

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:timestep_clock, room_id}, self())
    server = Pids.fetch!({:server, room_id})

    timer = MicroTimer.send_every(@timestep_µs, :step, self())

    {:ok,
     %{
       timer: timer,
       steps: 1,
       server: server,
       last_time: System.system_time(:microsecond)
     }}
  end

  @spec handle_info(:step, clock_state()) :: {:noreply, clock_state()}
  @impl true
  def handle_info(:step, %{
        timer: timer,
        steps: steps,
        server: server,
        last_time: last_time
      }) do
    curr_time = System.system_time(:microsecond)
    Telemetry.monitor_timestep_sync(curr_time, last_time, steps)

    if rem(steps, @tick_in_timesteps) == 0 do
      Server.broadcast_timesteps(server)
    end

    # TODO have all Instrument processes push

    {:noreply,
     %{
       timer: timer,
       steps: steps + 1,
       server: server,
       last_time: curr_time
     }}
  end
end
