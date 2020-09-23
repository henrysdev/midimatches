defmodule Progressions.RoomsDynamicSupervisor do
  use DynamicSupervisor

  alias Progressions.{
    RoomSupervisor,
    Pids
  }

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  # Check if a room process exists for the given id
  def room_exists?(room_id) do
    Pids.get_room(room_id) != nil
  end

  # Start a room under supervision
  def add_room(room_id) do
    if !room_exists?(room_id) do
      DynamicSupervisor.start_child(__MODULE__, {RoomSupervisor, room_id})
    else
      {:error, "room already exists for room_id #{room_id}"}
    end
  end

  # List current children
  def children do
    DynamicSupervisor.which_children(__MODULE__)
  end
end
