defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Types.Timestep
  }

  typedstruct do
    field(:room_id, String.t(), enforce: true)
    field(:timesteps, list(%Timestep{}), enforce: true, default: [])
  end

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:server, room_id}, self())
    {:ok, %__MODULE__{room_id: room_id, timesteps: []}}
  end

  @doc """
  Broadcasts next timesteps to all listening clients. Resets timesteps buffer.
  """
  @spec broadcast_timesteps(pid()) :: :ok
  def broadcast_timesteps(pid) do
    GenServer.cast(pid, :broadcast_timesteps)
  end

  @doc """
  Accepts timesteps from musician processes and adds them to timesteps buffer
  """
  @spec buffer_timesteps(pid(), list(%Timestep{})) :: :ok
  def buffer_timesteps(pid, new_timesteps) do
    GenServer.cast(pid, {:buffer_timesteps, new_timesteps})
  end

  @spec handle_cast(:broadcast_timesteps, %__MODULE__{}) :: {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast(:broadcast_timesteps, %__MODULE__{room_id: room_id, timesteps: timesteps}) do
    Logger.info("broadcasting tick")
    topic = "room:" <> room_id

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timesteps" => timesteps,
      "body" => "ASDFASDF"
    })

    {:noreply, %__MODULE__{room_id: room_id, timesteps: []}}
  end

  @spec handle_cast({:buffer_timesteps, list(%Timestep{})}, %__MODULE__{}) ::
          {:noreply, %__MODULE__{}}
  @impl true
  def handle_cast({:buffer_timesteps, new_timesteps}, %__MODULE__{
        room_id: room_id,
        timesteps: timesteps
      }) do
    Logger.info("buffering timesteps #{inspect(new_timesteps)}")
    # TODO buffer timestep properly
    timesteps = timesteps ++ new_timesteps

    {:noreply, %__MODULE__{room_id: room_id, timesteps: timesteps}}
  end
end
