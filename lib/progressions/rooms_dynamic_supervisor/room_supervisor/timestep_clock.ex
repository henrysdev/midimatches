defmodule Progressions.TimestepClock do
  use GenServer

  alias Progressions.{Telemetry}

  # TODO propagate these down via config
  @timestep_µs 50000
  @measure_in_timesteps 8
  @tick_in_timesteps 4

  alias Progressions.{
    Pids,
    Room
  }

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  def init(room_id) do
    timer = MicroTimer.send_every(@timestep_µs, :step, self())
    room = Pids.get_room(room_id)

    {:ok,
     %{
       timer: timer,
       steps: 1,
       room: room,
       last_time: System.system_time(:microsecond)
     }}
  end

  def handle_info(:step, %{
        timer: timer,
        steps: steps,
        room: room,
        last_time: last_time
      }) do
    curr_time = System.system_time(:microsecond)
    Telemetry.monitor_timestep_sync(curr_time, last_time, steps)

    if rem(steps, @tick_in_timesteps) == 0 do
      Room.broadcast(room)
    end

    # TODO have all Instrument processes push

    {:noreply,
     %{
       timer: timer,
       steps: steps + 1,
       room: room,
       last_time: curr_time
     }}
  end
end
