defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer

  alias Progressions.{Pids}

  @type room_state() :: %{
          room_id: String.t(),
          timesteps: []
        }

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  @impl true
  def init([room_id]) do
    Pids.register_room(room_id, self())
    {:ok, %{room_id: room_id, timesteps: []}}
  end

  @doc """
  Broadcasts next timesteps to all listening clients. Resets timesteps buffer.
  """
  @spec broadcast_timesteps(pid()) :: :ok
  def broadcast_timesteps(pid) do
    GenServer.cast(pid, :broadcast_timesteps)
  end

  @spec handle_cast(:broadcast_timesteps, room_state()) :: {:noreply, room_state()}
  def handle_cast(:broadcast_timesteps, %{room_id: room_id, timesteps: timesteps}) do
    topic = "room:" <> room_id

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timesteps" => timesteps,
      "body" => "ASDFASDF"
    })

    {:noreply, %{room_id: room_id, timesteps: []}}
  end
end
