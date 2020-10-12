defmodule Progressions.Rooms.Room.Musicians.Musician do
  @moduledoc """
  Maintains state and exposes API for interacting with a single musician
  """
  use GenServer
  use TypedStruct

  alias Progressions.{
    Pids,
    Rooms.Room.Musicians.Musician,
    Rooms.Room.Server,
    Types.Loop,
    Types.MusicianConfig,
    Types.Note,
    Types.TimestepSlice
  }

  @default_musician_config %MusicianConfig{
    loop: %Loop{
      start_timestep: 0,
      length: 8,
      timestep_slices: [
        %TimestepSlice{
          timestep: 0,
          notes: [
            %Note{
              instrument: "kick",
              key: 11,
              duration: 1
            }
          ]
        }
      ]
    }
  }

  @type timestep_slices() :: list(%TimestepSlice{})
  @type deadline() :: integer()
  @type queue() :: :queue.queue(%TimestepSlice{})
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

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id, musician_id]), do: init([room_id, musician_id, @default_musician_config])

  def init([room_id, musician_id, musician_config = %MusicianConfig{}]) do
    Pids.register({:musician, {musician_id, room_id}}, self())
    server = Pids.fetch!({:server, room_id})

    {:ok,
     %Musician{
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
  @spec new_loop(pid(), %Loop{}) :: :ok
  def new_loop(pid, %Loop{} = loop) do
    GenServer.cast(pid, {:new_loop, loop})
  end

  @doc """
  Pushes the timestep to the server. This method should only be called by the
  TimestepClock process.
  """
  @spec next_timestep(pid(), integer()) :: :ok
  def next_timestep(pid, clock_timestep) do
    GenServer.cast(pid, {:next_timestep, clock_timestep})
  end

  ## Callbacks
  @spec handle_cast({:new_loop, %Loop{}}, %Musician{}) ::
          {:noreply, %Musician{}}
  @impl true
  def handle_cast(
        {:new_loop, %Loop{} = new_loop},
        %Musician{
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
     %Musician{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop,
       last_timestep: last_timestep,
       playhead: playhead
     }}
  end

  @spec handle_cast({:next_timestep, integer()}, %Musician{}) ::
          {:noreply, %Musician{}}
  @impl true
  def handle_cast(
        {:next_timestep, clock_timestep},
        %Musician{active_loop: nil} = state
      ) do
    {:noreply, Map.put(state, :last_timestep, clock_timestep)}
  end

  def handle_cast(
        {:next_timestep, clock_timestep},
        %Musician{
          server: server,
          musician_id: musician_id,
          room_id: room_id,
          active_loop: active_loop,
          potential_loop: potential_loop,
          playhead: playhead
        }
      ) do
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

    # send due timestep slices to server buffer
    {queue, timestep_slices_to_buffer} = pop_due_timestep_slices(queue, clock_timestep)

    if length(timestep_slices_to_buffer) > 0 do
      Server.buffer_timestep_slices(server, timestep_slices_to_buffer)
    end

    {:noreply,
     %Musician{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop,
       last_timestep: clock_timestep,
       playhead: {deadline, queue}
     }}
  end

  ## Private methods
  @spec restart_loop_playhead(%Loop{}, integer()) :: playhead()
  defp restart_loop_playhead(loop, curr_timestep) do
    queue =
      loop.timestep_slices
      |> Enum.reduce(:queue.new(), fn %TimestepSlice{timestep: timestep} = timestep_slice, q ->
        timestep_slice
        |> Map.put(:timestep, curr_timestep + timestep)
        |> :queue.in(q)
      end)

    {loop.length + curr_timestep, queue}
  end

  @spec pop_due_timestep_slices(queue(), integer(), timestep_slices()) ::
          {queue(), timestep_slices()}
  defp pop_due_timestep_slices(queue, clock_timestep, acc_timestep_slices \\ []) do
    case :queue.peek(queue) do
      {:value, %TimestepSlice{timestep: timestep}} when timestep <= clock_timestep ->
        {{:value, %TimestepSlice{} = timestep_slice}, queue} = :queue.out(queue)
        pop_due_timestep_slices(queue, clock_timestep, [timestep_slice | acc_timestep_slices])

      _ ->
        {queue, acc_timestep_slices}
    end
  end
end
