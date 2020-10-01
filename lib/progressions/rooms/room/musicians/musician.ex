defmodule Progressions.Rooms.Room.Musicians.Musician do
  @moduledoc """
  Maintains state and exposes API for interacting with a single musician
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.Server,
    Types.Loop,
    Types.Timestep
  }

  @type timesteps() :: list(%Timestep{})
  @type deadline() :: integer()
  @type queue() :: :queue.queue(%Timestep{})
  @typedoc """
  The playhad structure represents the playhead for the playing loop. The
  tuple contains a timestep deadline (the timestep when the loop should be
  restarted), and a queue that holds the ordered timesteps that make up the
  loop.
  """
  @type playhead() :: {deadline(), queue()}

  typedstruct do
    field(:musician_id, String.t(), enforce: true)
    field(:room_id, String.t(), enforce: true)
    field(:active_loop, %Loop{}, default: %{})
    field(:potential_loop, %Loop{}, default: %{})
    field(:server, pid(), enforce: true)
    field(:last_timestep, integer(), enforce: true)
    field(:playhead, playhead())
  end

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg)
  end

  @impl true
  def init([musician_id, room_id]) do
    Pids.register({:musician, {musician_id, room_id}}, self())
    server = Pids.fetch!({:server, room_id})

    {:ok,
     %__MODULE__{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: nil,
       potential_loop: nil,
       last_timestep: 0,
       playhead: {0, :queue.new()}
     }}
  end

  @doc """
  Processes a new loop play event.
  """
  def new_loop(pid, %Loop{} = loop) do
    GenServer.cast(pid, {:new_loop, loop})
  end

  @doc """
  Pushes the timestep to the server. This method should only be called by the
  TimestepClock process.
  """
  @spec send_next_timestep(pid(), integer()) :: :ok
  def send_next_timestep(pid, clock_timestep) do
    GenServer.cast(pid, {:send_next_timestep, clock_timestep})
  end

  @spec handle_cast({:new_loop, %Loop{}}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(
        {:new_loop, %Loop{} = new_loop},
        %__MODULE__{
          server: server,
          musician_id: musician_id,
          room_id: room_id,
          potential_loop: potential_loop,
          last_timestep: last_timestep
        }
      ) do
    # TODO take ticks/measures into account for restart invervals
    playhead = restart_loop_playhead(new_loop, last_timestep)
    active_loop = new_loop

    {:noreply,
     %__MODULE__{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop,
       last_timestep: last_timestep,
       playhead: playhead
     }}
  end

  @spec handle_cast({:send_next_timestep, integer()}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(
        {:send_next_timestep, clock_timestep},
        %__MODULE__{active_loop: nil} = state
      ) do
    {:noreply, Map.put(state, :last_timestep, clock_timestep)}
  end

  def handle_cast(
        {:send_next_timestep, clock_timestep},
        %__MODULE__{
          server: server,
          musician_id: musician_id,
          room_id: room_id,
          active_loop: active_loop,
          potential_loop: potential_loop,
          playhead: playhead
        }
      ) do
    Logger.info("send_next_timestep called w/ clock_timestep: #{inspect(clock_timestep)}")

    # restart loop playhead if current timestep is at or past deadline
    {deadline, queue} =
      case playhead do
        # TODO take ticks/measures into account for restart invervals
        {deadline, _queue} when deadline <= clock_timestep ->
          restart_loop_playhead(active_loop, clock_timestep)

        {_deadline, _queue} ->
          playhead

        other ->
          raise "Unexpected match for playhead struct #{inspect(other)}"
      end

    # send due timesteps to server buffer
    {queue, timesteps_to_buffer} = pop_due_timesteps(queue, clock_timestep)

    if length(timesteps_to_buffer) > 0 do
      Server.buffer_timesteps(server, timesteps_to_buffer)
    end

    {:noreply,
     %__MODULE__{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop,
       last_timestep: clock_timestep,
       playhead: {deadline, queue}
     }}
  end

  @spec restart_loop_playhead(%Loop{}, integer()) :: playhead()
  defp restart_loop_playhead(loop, curr_timestep) do
    queue =
      loop.timestep_slices
      |> Enum.reduce(:queue.new(), fn %Timestep{step: step} = tstep, q ->
        tstep
        |> Map.put(:step, curr_timestep + step)
        |> :queue.in(q)
      end)

    {loop.length + curr_timestep, queue}
  end

  @spec pop_due_timesteps(queue(), integer(), timesteps()) :: {queue(), timesteps()}
  defp pop_due_timesteps(queue, clock_timestep, acc_timesteps \\ []) do
    case :queue.peek(queue) do
      {:value, %Timestep{step: step}} when step <= clock_timestep ->
        {{:value, %Timestep{} = timestep}, queue} = :queue.out(queue)
        pop_due_timesteps(queue, clock_timestep, [timestep | acc_timesteps])

      _ ->
        {queue, acc_timesteps}
    end
  end
end
