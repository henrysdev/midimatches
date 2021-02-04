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

  @spec start_link(any) :: :ignore | {:error, any} | {:ok, pid}
  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @spec room_exists?(id()) :: boolean()
  @doc """
  Check if a room process exists for the given id
  """
  def room_exists?(room_id) do
    Pids.fetch({:room, room_id}) != nil
  end

  @spec add_room(id(), String.t()) :: {atom(), pid() | String.t()}
  @doc """
  Start a room under supervision.
  """
  def add_room(room_id, room_name) do
    if room_exists?(room_id) do
      {:error, "room already exists for room_id #{room_id}"}
    else
      DynamicSupervisor.start_child(__MODULE__, {Room, [{room_id, room_name}]})
    end
  end

  @spec drop_room(id()) :: {atom(), pid() | String.t()}
  @doc """
  Drop room from supervision tree
  """
  def drop_room(room_id) do
    room = Pids.fetch({:room, room_id})

    if room != nil do
      DynamicSupervisor.terminate_child(__MODULE__, room)
    else
      {:error, "room cannot be dropped as no room exists for room_id #{room_id}"}
    end
  end

  @spec list_rooms() :: list()
  @doc """
  List current rooms
  """
  def list_rooms do
    DynamicSupervisor.which_children(__MODULE__)
  end

  @spec configure_rooms(list(%RoomConfig{})) :: :ok
  @doc """
  Start child room processes with given configurations. Only to be called when starting a room
  from a configuration
  """
  def configure_rooms(room_configs) do
    room_configs
    |> Enum.each(fn cfg ->
      room_id = Persistence.gen_serial_id()
      DynamicSupervisor.start_child(__MODULE__, {Room, [{room_id, cfg.room_name, cfg}]})
    end)
  end
end
