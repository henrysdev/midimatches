defmodule Progressions.Rooms.Room.Musicians.Musician do
  @moduledoc """
  Maintains state and exposes API for interacting with a single musician
  """
  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Progressions.{
    Types.Note,
    Pids,
    Rooms.Room.Server
  }

  typedstruct do
    field(:musician_id, String.t(), enforce: true)
    field(:room_id, String.t(), enforce: true)
    field(:active_loop, %{}, default: %{})
    field(:potential_loop, %{}, default: %{})
    field(:server, pid(), enforce: true)
  end

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg)
  end

  @impl true
  def init([musician_id, room_id]) do
    Pids.register({:musician, {musician_id, room_id}}, self())
    server = Pids.fetch!({:server, room_id})

    {:ok,
     %Musician{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: %{},
       potential_loop: %{}
     }}
  end

  @doc """
  Processes a new note play event
  """
  @spec note_played(pid(), %Note{}) :: :ok
  def note_played(pid, %Note{} = note_played_event) do
    GenServer.cast(pid, {:note_played, note_played_event})
  end

  @doc """
  Pushes the active loop to the server. Should only be called by TimestepClock
  """
  @spec send_next_loop(pid()) :: :ok
  def send_next_loop(pid) do
    GenServer.cast(pid, :send_next_loop)
  end

  @spec handle_cast({:note_played, %Note{}}, %Musician{}) ::
          {:noreply, %Musician{}}
  @impl true
  def handle_cast(
        {:note_played, %Note{} = _note_played_event},
        %Musician{
          server: server,
          musician_id: musician_id,
          room_id: room_id,
          active_loop: active_loop,
          potential_loop: potential_loop
        }
      ) do
    # TODO handle loop note additions

    {:noreply,
     %Musician{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop
     }}
  end

  @spec handle_cast(:send_next_loop, %Musician{}) ::
          {:noreply, %Musician{}}
  @impl true
  def handle_cast(
        :send_next_loop,
        %Musician{
          server: server,
          musician_id: musician_id,
          room_id: room_id,
          active_loop: active_loop,
          potential_loop: potential_loop
        }
      ) do
    # TODO send active loop to server

    {:noreply,
     %Musician{
       server: server,
       musician_id: musician_id,
       room_id: room_id,
       active_loop: active_loop,
       potential_loop: potential_loop
     }}
  end
end
