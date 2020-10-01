defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Types.TimestepSlice
  }

  @type timestep_slices() :: list(%TimestepSlice{})

  typedstruct enforce: true do
    field(:room_id, String.t())
    field(:timestep_slices, timestep_slices())
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:server, room_id}, self())
    {:ok, %__MODULE__{room_id: room_id, timestep_slices: []}}
  end

  @doc """
  Broadcasts next tick's worth of timestep slices to all listening clients.
  """
  @spec broadcast_next_tick(pid()) :: :ok
  def broadcast_next_tick(pid) do
    GenServer.cast(pid, :broadcast_next_tick)
  end

  @doc """
  Accepts timestep slices from musician processes and adds them to timestep
  slices buffer.
  """
  @spec buffer_timestep_slices(pid(), timestep_slices()) :: :ok
  def buffer_timestep_slices(pid, new_timestep_slices) do
    GenServer.cast(pid, {:buffer_timestep_slices, new_timestep_slices})
  end

  @spec handle_cast(:broadcast_next_tick, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(:broadcast_next_tick, %__MODULE__{
        room_id: room_id,
        timestep_slices: timestep_slices
      }) do
    topic = "room:" <> room_id

    Logger.debug("broadcast timestep_slices: #{inspect(timestep_slices, pretty: true)}")

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timestep_slices" => timestep_slices,
      "body" => "ASDFASDF"
    })

    {:noreply, %__MODULE__{room_id: room_id, timestep_slices: []}}
  end

  @spec handle_cast({:buffer_timestep_slices, timestep_slices()}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast({:buffer_timestep_slices, new_timestep_slices}, %__MODULE__{
        room_id: room_id,
        timestep_slices: timestep_slices
      }) do
    # TODO buffer timestep properly
    timestep_slices = timestep_slices ++ new_timestep_slices

    {:noreply, %__MODULE__{room_id: room_id, timestep_slices: timestep_slices}}
  end
end
