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

  typedstruct do
    field(:room_id, String.t(), enforce: true)
    field(:timestep_slices, list(%TimestepSlice{}), enforce: true, default: [])
  end

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:server, room_id}, self())
    {:ok, %__MODULE__{room_id: room_id, timestep_slices: []}}
  end

  @doc """
  Broadcasts next timesteps to all listening clients. Resets timesteps buffer.
  """
  @spec broadcast_timestep_slices(pid()) :: :ok
  def broadcast_timestep_slices(pid) do
    GenServer.cast(pid, :broadcast_timestep_slices)
  end

  @doc """
  Accepts timesteps from musician processes and adds them to timesteps buffer
  """
  @spec buffer_timestep_slices(pid(), list(%TimestepSlice{})) :: :ok
  def buffer_timestep_slices(pid, new_timestep_slices) do
    GenServer.cast(pid, {:buffer_timestep_slices, new_timestep_slices})
  end

  @spec handle_cast(:broadcast_timestep_slices, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(:broadcast_timestep_slices, %__MODULE__{
        room_id: room_id,
        timestep_slices: timestep_slices
      }) do
    Logger.info("broadcasting tick")
    topic = "room:" <> room_id

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timestep_slices" => timestep_slices,
      "body" => "ASDFASDF"
    })

    {:noreply, %__MODULE__{room_id: room_id, timestep_slices: []}}
  end

  @spec handle_cast({:buffer_timestep_slices, list(%TimestepSlice{})}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast({:buffer_timestep_slices, new_timestep_slices}, %__MODULE__{
        room_id: room_id,
        timestep_slices: timestep_slices
      }) do
    Logger.info("buffering timestep slices #{inspect(new_timestep_slices)}")
    # TODO buffer timestep properly
    timestep_slices = timestep_slices ++ new_timestep_slices

    {:noreply, %__MODULE__{room_id: room_id, timestep_slices: timestep_slices}}
  end
end
