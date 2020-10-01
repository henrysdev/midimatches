defmodule Progressions.Rooms.Room.TimestepClock do
  @moduledoc """
  Clock process that facilitates timestep events within a room 
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Telemetry
  }

  typedstruct do
    field(:server, pid(), enforce: true)
    field(:musicians, pid(), enforce: true)
    field(:step, integer(), enforce: true, default: 0)
    field(:last_time, integer(), enforce: true)
  end

  # TODO propagate these down via config
  @timestep_µs 50_000
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
    MicroTimer.send_every(@timestep_µs, :step, self())

    {:ok,
     %__MODULE__{
       step: 1,
       server: Pids.fetch!({:server, room_id}),
       musicians: Pids.fetch!({:musicians, room_id}),
       last_time: System.system_time(:microsecond)
     }}
  end

  @spec handle_info(:step, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_info(:step, %__MODULE__{
        step: step,
        server: server,
        musicians: musicians,
        last_time: last_time
      }) do
    curr_time = System.system_time(:microsecond)

    Telemetry.monitor_timestep_sync(curr_time, last_time, step)

    if rem(step, @tick_in_timesteps) == 0 do
      Server.broadcast_timesteps(server)
    end

    message_all_musicians(musicians, step)

    {:noreply,
     %__MODULE__{
       step: step + 1,
       server: server,
       musicians: musicians,
       last_time: curr_time
     }}
  end

  @spec message_all_musicians(pid(), integer()) :: :ok
  defp message_all_musicians(musicians, step) do
    Musicians.list_musicians(musicians)
    |> Enum.map(fn {_, p, _, _} -> p end)
    |> Enum.each(&Musician.send_next_timestep(&1, step))
  end
end
