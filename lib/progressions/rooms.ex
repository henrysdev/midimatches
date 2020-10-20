defmodule Progressions.Rooms do
  @moduledoc """
  Dynamic supervisor for all rooms
  """
  use DynamicSupervisor

  alias Progressions.{
    Persistence,
    Pids,
    Rooms.Room,
    Types.Configs.RoomConfig
  }

  @type id() :: String.t()

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @doc """
  Check if a room process exists for the given id
  """
  @spec room_exists?(id()) :: boolean()
  def room_exists?(room_id) do
    Pids.fetch({:room, room_id}) != nil
  end

  @doc """
  Start a room under supervision.
  """
  @spec add_room(id()) :: {atom(), pid() | String.t()}
  def add_room(room_id) do
    if room_exists?(room_id) do
      {:error, "room already exists for room_id #{room_id}"}
    else
      DynamicSupervisor.start_child(__MODULE__, {Room, [room_id]})
    end
  end

  @doc """
  Drop room from supervision tree
  """
  @spec drop_room(id()) :: {atom(), pid() | String.t()}
  def drop_room(room_id) do
    room = Pids.fetch({:room, room_id})

    if room != nil do
      DynamicSupervisor.terminate_child(__MODULE__, room)
    else
      {:error, "room cannot be dropped as no room exists for room_id #{room_id}"}
    end
  end

  @doc """
  List current rooms
  """
  @spec list_rooms() :: list()
  def list_rooms do
    DynamicSupervisor.which_children(__MODULE__)
  end

  @doc """
  Start child room processes with given configurations. Only to be called when starting a room
  from a configuration
  """
  @spec configure_rooms(list(%RoomConfig{})) :: :ok
  def configure_rooms(room_configs) do
    room_configs
    |> Enum.each(
      &DynamicSupervisor.start_child(
        __MODULE__,
        {Room, [Persistence.gen_serial_id(), &1]}
      )
    )
  end
end
