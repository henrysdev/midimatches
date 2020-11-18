defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Types.Configs.ServerConfig,
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

  @spec start_link(any) :: :ignore | {:error, any} | {:ok, pid}
  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  @spec init(any) :: {:ok, %__MODULE__{}}
  def init(args) do
    {room_id, server_config} =
      case args do
        [room_id] -> {room_id, %ServerConfig{}}
        [room_id, server_config] -> {room_id, server_config}
      end

    Pids.register({:server, room_id}, self())

    # configure musicians map
    musicians_map =
      server_config.musicians
      |> Enum.reduce(%{}, fn %Musician{} = elem, acc ->
        Map.put(acc, elem.musician_id, elem)
      end)

    {:ok,
     %__MODULE__{
       room_id: room_id,
       room_start_utc: :os.system_time(:microsecond),
       timestep_us: server_config.timestep_us,
       musicians: musicians_map
     }}
  end

  ## API

  @spec add_musician(pid(), %Musician{}) :: :ok
  @doc """
  Add a new musician to the room
  """
  def add_musician(pid, %Musician{} = musician) do
    GenServer.cast(pid, {:add_musician, musician})
  end

  @spec update_musician_loop(pid(), id(), %Loop{}) :: :ok
  @doc """
  Update given musician with a new loop
  """
  def update_musician_loop(pid, musician_id, %Loop{} = loop) do
    GenServer.cast(pid, {:update_musician_loop, loop, musician_id})
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

  @spec handle_cast({:update_musician_loop, %Loop{}, id()}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(
        {:update_musician_loop,
         loop = %Loop{start_timestep: loop_start_timestep, length: loop_length}, musician_id},
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
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "broadcast_updated_musician_loop", %{
      "musician_id" => musician_id,
      "loop" => %Loop{loop | start_timestep: deadline_timestep}
    })

    {:noreply, %__MODULE__{state | musicians: musicians_map}}
  end
end
