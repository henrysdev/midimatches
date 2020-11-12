defmodule Progressions.Rooms.Room.LoopServer do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.LoopServer,
    Types.Loop,
    Utils
  }

  @type id() :: String.t()

  typedstruct enforce: true do
    field(:room_id, String.t())
    field(:room_start_utc, integer())
    field(:timestep_us, integer())
    field(:musicians, %{})
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:server, room_id}, self())
    room_start_utc = :os.system_time(:microsecond)
    # TODO propogate down via config
    timestep_us = 500_000

    {:ok,
     %LoopServer{
       room_id: room_id,
       room_start_utc: room_start_utc,
       timestep_us: timestep_us,
       musicians: %{}
     }}
  end

  ## API

  @spec receive_loop(pid(), id(), %Loop{}) :: :ok
  def receive_loop(pid, musician_id, loop = %Loop{}) do
    GenServer.cast(pid, {:receive_loop, loop, musician_id})
  end

  ## Callbacks

  @spec handle_cast({:receive_loop, %Loop{}, id()}, %LoopServer{}) :: {:noreply, %LoopServer{}}
  @impl true
  def handle_cast(
        {:receive_loop, loop = %Loop{start_timestep: loop_start_timestep, length: loop_length},
         musician_id},
        %LoopServer{
          room_id: room_id,
          room_start_utc: room_start_utc,
          timestep_us: timestep_us,
          musicians: musicians_map
        } = state
      ) do
    # update loop in musicians data structure
    musicians_map =
      if Map.has_key?(musicians_map, musician_id) do
        Map.update!(musicians_map, musician_id, fn x -> %{x | loop: loop} end)
      else
        musicians_map
      end

    # determine deadline for clients to start playing
    current_timestep = div(:os.system_time(:microsecond) - room_start_utc, timestep_us)
    deadline_timestep = Utils.calc_deadline(current_timestep, loop_start_timestep, loop_length)

    # broadcast to all clients
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "new_loop", %{
      "musician_id" => musician_id,
      "loop" => %Loop{loop | start_timestep: deadline_timestep}
    })

    {:noreply, %LoopServer{state | musicians: musicians_map}}
  end
end
