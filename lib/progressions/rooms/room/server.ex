defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct

  alias __MODULE__

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
    {:ok, %Server{room_id: room_id, timesteps: []}}
  end

  @doc """
  Broadcasts next timesteps to all listening clients. Resets timesteps buffer.
  """
  @spec broadcast_timesteps(pid()) :: :ok
  def broadcast_timesteps(pid) do
    GenServer.cast(pid, :broadcast_timesteps)
  end

  @spec handle_cast(:broadcast_timesteps, %Server{}) :: {:noreply, %Server{}}
  @impl true
  def handle_cast(:broadcast_timesteps, %Server{room_id: room_id, timesteps: timesteps}) do
    topic = "room:" <> room_id

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timesteps" => timesteps,
      "body" => "ASDFASDF"
    })

    {:noreply, %Server{room_id: room_id, timesteps: []}}
  end
end
