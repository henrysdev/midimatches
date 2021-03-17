defmodule Midimatches.Rooms do
  @moduledoc """
  Dynamic supervisor for all rooms
  """
  use DynamicSupervisor

  alias Midimatches.{
    Pids,
    Rooms.Room,
    Types.ClientRoomState,
    Types.Configs.RoomConfig,
    Utils
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
  Check if a room process exists for the given id.
  """
  def room_exists?(room_id) do
    Pids.fetch({:room_supervisor, room_id}) != nil
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
  Drop room process from supervision tree.
  """
  def drop_room(room_id) do
    room = Pids.fetch({:room_supervisor, room_id})

    if room != nil do
      DynamicSupervisor.terminate_child(__MODULE__, room)
    else
      {:error, "room cannot be dropped as no room exists for room_id #{room_id}"}
    end
  end

  @spec list_rooms() :: list()
  @doc """
  List currently active room processes.
  """
  def list_rooms do
    DynamicSupervisor.which_children(__MODULE__)
  end

  @spec get_rooms_list() :: list(%ClientRoomState{})
  @doc """
  Returns a list of room states for currently active room servers
  """
  def get_rooms_list do
    get_rooms_pid_list()
    |> Stream.map(&:sys.get_state(&1))
    |> Enum.map(&Utils.server_to_client_room_state(&1))
  end

  @spec get_rooms_pid_list() :: list(%ClientRoomState{})
  @doc """
  Returns a list of room pids of currently active room severs
  """
  def get_rooms_pid_list do
    DynamicSupervisor.which_children(__MODULE__)
    |> Stream.map(fn {_, room_supervisor, _, _} -> room_supervisor end)
    |> Stream.map(&Supervisor.which_children(&1))
    |> Enum.map(fn [{_, room_server, _, _}] -> room_server end)
  end

  @spec configure_rooms(list(%RoomConfig{})) :: :ok
  @doc """
  Start room processes with given configurations.
  """
  def configure_rooms(room_configs) do
    room_configs
    |> Enum.each(&configure_room/1)
  end

  @spec configure_room(%RoomConfig{}) :: id()
  @doc """
  Start a room process with the given configuration.
  """
  def configure_room(%RoomConfig{} = room_config) do
    room_id = Utils.gen_uuid()

    DynamicSupervisor.start_child(
      __MODULE__,
      {Room, [{room_id, room_config.room_name, room_config}]}
    )

    room_id
  end
end
