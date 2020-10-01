defmodule Progressions.Rooms.Room.TimestepClock do
  @moduledoc """
  Clock process that facilitates timestep events within a room 
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.Musicians,
    Rooms.Room.Musicians.Musician,
    Rooms.Room.Server,
    TelemetryMonitor
  }

  typedstruct do
    field(:server, pid(), enforce: true)
    field(:musicians, pid(), enforce: true)
    field(:timestep, integer(), enforce: true)
    field(:last_time, integer(), enforce: true)
    field(:timestep_µs, integer(), default: 50_000)
    field(:tick_in_timesteps, integer(), default: 4)
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id, %{timestep_µs: timestep_µs, tick_in_timesteps: tick_in_timesteps}]) do
    Pids.register({:timestep_clock, room_id}, self())
    MicroTimer.send_every(timestep_µs, :increment_timestep, self())

    {:ok,
     %__MODULE__{
       timestep: 1,
       server: Pids.fetch!({:server, room_id}),
       musicians: Pids.fetch!({:musicians, room_id}),
       last_time: System.system_time(:microsecond),
       timestep_µs: timestep_µs,
       tick_in_timesteps: tick_in_timesteps
     }}
  end

  @spec handle_info(:increment_timestep, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_info(:increment_timestep, %__MODULE__{
        timestep: timestep,
        server: server,
        musicians: musicians,
        last_time: last_time,
        timestep_µs: timestep_µs,
        tick_in_timesteps: tick_in_timesteps
      }) do
    Logger.info("clock_timestep=#{timestep}")
    curr_time = System.system_time(:microsecond)

    TelemetryMonitor.check_clock_precision(curr_time, last_time, timestep)

    if rem(timestep, tick_in_timesteps) == 0 do
      Server.broadcast_next_tick(server)
    end

    message_all_musicians(musicians, timestep)

    {:noreply,
     %__MODULE__{
       timestep: timestep + 1,
       server: server,
       musicians: musicians,
       last_time: curr_time,
       timestep_µs: timestep_µs,
       tick_in_timesteps: tick_in_timesteps
     }}
  end

  @spec message_all_musicians(pid(), integer()) :: :ok
  defp message_all_musicians(musicians, timestep) do
    Musicians.list_musicians(musicians)
    |> Enum.map(fn {_, p, _, _} -> p end)
    |> Enum.each(&Musician.next_timestep(&1, timestep))
  end
end
