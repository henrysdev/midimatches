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
    Types.Configs.MusicianConfig,
    Types.Loop,
    Types.TimestepSlice
  }

  @type timestep_slices() :: list(%TimestepSlice{})
  @type deadline() :: integer()
  @type queue() :: :queue.queue(%TimestepSlice{})
  @typedoc """
  The playhead structure represents the playhead for the playing loop. The
  tuple contains a timestep deadline (the timestep when the loop should be
  restarted), and a queue that holds the ordered timesteps that make up the
  loop.
  """
  @type playhead() :: {deadline(), queue()}

  typedstruct enforce: true do
    field(:musician_id, String.t())
    field(:room_id, String.t())
    field(:active_loop, %Loop{})
    field(:server, pid())
    field(:last_timestep, integer())
    field(:playhead, playhead())
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id, musician_id]), do: init([room_id, musician_id, %MusicianConfig{}])

  def init([room_id, musician_id, %MusicianConfig{loop: loop}]) do
    Pids.register({:musician, {musician_id, room_id}}, self())

    {:ok,
     %Musician{
       server: Pids.fetch!({:server, room_id}),
       musician_id: musician_id,
       room_id: room_id,
       active_loop: loop,
       last_timestep: -1,
       playhead: {loop.start_timestep, :queue.new()}
     }}
  end

  ## API

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
        %Musician{last_timestep: last_timestep} = state
      ) do
    playhead = recalibrate_loop_playhead(new_loop, last_timestep)
    active_loop = new_loop

    {:noreply,
     %Musician{
       state
       | active_loop: active_loop,
         playhead: playhead
     }}
  end

  @spec handle_cast({:next_timestep, integer()}, %Musician{}) ::
          {:noreply, %Musician{}}
  @impl true
  def handle_cast(
        {:next_timestep, clock_timestep},
        %Musician{
          server: server,
          active_loop: active_loop,
          playhead: {deadline, queue}
        } = state
      ) do
    # restart loop playhead if current timestep is at or past deadline.
    {deadline, queue} =
      case {deadline, queue} do
        {deadline, _queue} when deadline <= clock_timestep ->
          recalibrate_loop_playhead(active_loop, clock_timestep)

        {_deadline, _queue} ->
          {deadline, queue}
      end

    {queue, timestep_slices_to_buffer} = pop_due_timestep_slices(queue, clock_timestep)

    # send due timestep slices to server buffer as side effect
    if length(timestep_slices_to_buffer) > 0 do
      Server.buffer_timestep_slices(server, timestep_slices_to_buffer)
    end

    {:noreply,
     %Musician{
       state
       | last_timestep: clock_timestep,
         playhead: {deadline, queue}
     }}
  end

  ## Helpers

  @spec recalibrate_loop_playhead(%Loop{}, integer()) :: playhead()
  defp recalibrate_loop_playhead(
         %Loop{length: loop_length, start_timestep: loop_start_timestep} = loop,
         curr_timestep
       ) do
    deadline = calc_deadline(curr_timestep, loop_start_timestep, loop_length)

    queue =
      loop.timestep_slices
      |> Enum.reduce(:queue.new(), fn %TimestepSlice{timestep: position_in_loop} = timestep_slice,
                                      q ->
        timestep_slice
        |> Map.put(:timestep, deadline - loop_length + position_in_loop)
        |> :queue.in(q)
      end)

    {deadline, queue}
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

  @spec calc_deadline(integer(), integer(), integer()) :: integer()
  def calc_deadline(_curr_timestep, _loop_start_timestep, loop_length) when loop_length <= 0 do
    {:error, "loop length must be greater than zero"}
  end

  def calc_deadline(curr_timestep, loop_start_timestep, loop_length) do
    loop_rem = rem(curr_timestep - loop_start_timestep, loop_length)

    case loop_rem do
      _ when curr_timestep < loop_start_timestep -> loop_start_timestep
      0 -> curr_timestep + loop_length
      loop_rem -> curr_timestep + loop_length - loop_rem
    end
  end
end
