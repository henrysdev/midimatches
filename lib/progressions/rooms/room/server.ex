defmodule Progressions.Rooms.Room.Server do
  @moduledoc """
  Maintains state and exposes API for interacting with a single room
  """
  use GenServer
  use TypedStruct
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.Server,
    Telemetry.EventLog,
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
    {:ok, %Server{room_id: room_id, timestep_slices: []}}
  end

  ## API

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

  ## Callbacks

  @spec handle_cast(:broadcast_next_tick, %Server{}) :: {:noreply, %Server{}}
  @impl true
  def handle_cast(
        :broadcast_next_tick,
        %Server{
          room_id: room_id,
          timestep_slices: timestep_slices
        } = state
      ) do
    topic = "room:#{room_id}"

    EventLog.log("broadcast timestep_slices: #{inspect(timestep_slices)}", room_id)

    ProgressionsWeb.Endpoint.broadcast(topic, "timesteps", %{
      "timestep_slices" => timestep_slices,
      "body" => "ASDFASDF"
    })

    {:noreply, %Server{state | timestep_slices: []}}
  end

  @spec handle_cast({:buffer_timestep_slices, timestep_slices()}, %Server{}) ::
          {:noreply, %Server{}}
  @impl true
  def handle_cast(
        {:buffer_timestep_slices, new_timestep_slices},
        %Server{
          timestep_slices: timestep_slices
        } = state
      ) do
    # TODO buffer timestep properly
    timestep_slices = timestep_slices ++ new_timestep_slices

    {:noreply, %Server{state | timestep_slices: timestep_slices}}
  end
end
