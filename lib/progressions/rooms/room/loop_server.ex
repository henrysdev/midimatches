defmodule Progressions.Rooms.Room.LoopServer do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Types.Configs.LoopServerConfig,
    Types.Loop,
    Types.Musician,
    Utils
  }

  @type id() :: String.t()

  typedstruct enforce: true do
    field(:room_id, String.t())
    field(:room_start_utc, integer())
    field(:timestep_us, integer())
    field(:musicians, %{required(id()) => %Musician{}})
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, loop_server_config} =
      case args do
        [room_id] -> {room_id, %LoopServerConfig{}}
        [room_id, loop_server_config] -> {room_id, loop_server_config}
      end

    Pids.register({:loop_server, room_id}, self())

    # configure musicians map
    musicians_map =
      loop_server_config.musicians
      |> Enum.reduce(%{}, fn %Musician{} = elem, acc ->
        Map.put(acc, elem.musician_id, elem)
      end)

    {:ok,
     %__MODULE__{
       room_id: room_id,
       room_start_utc: :os.system_time(:microsecond),
       timestep_us: loop_server_config.timestep_us,
       musicians: musicians_map
     }}
  end

  ## API

  @spec add_musician(pid(), %Musician{}) :: :ok
  def add_musician(pid, %Musician{} = musician) do
    GenServer.cast(pid, {:add_musician, musician})
  end

  @spec receive_loop(pid(), id(), %Loop{}) :: :ok
  def receive_loop(pid, musician_id, %Loop{} = loop) do
    GenServer.cast(pid, {:receive_loop, loop, musician_id})
  end

  ## Callbacks

  @spec handle_cast({:add_musician, %Musician{}}, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(
        {:add_musician, musician = %Musician{musician_id: musician_id}},
        %__MODULE__{musicians: musicians_map} = state
      ) do
    # add musician to musicians map if not already there
    musicians_map =
      if Map.has_key?(musicians_map, musician_id) do
        musicians_map
      else
        Map.put(musicians_map, musician_id, musician)
      end

    {:noreply, %__MODULE__{state | musicians: musicians_map}}
  end

  @spec handle_cast({:receive_loop, %Loop{}, id()}, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(
        {:receive_loop, loop = %Loop{start_timestep: loop_start_timestep, length: loop_length},
         musician_id},
        %__MODULE__{
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

    {:noreply, %__MODULE__{state | musicians: musicians_map}}
  end
end
