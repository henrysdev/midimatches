defmodule Progressions.Rooms do
  @moduledoc """
  Dynamic supervisor for all rooms
  """
  use DynamicSupervisor

  alias Progressions.{
    Pids,
    Rooms.Room
  }

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
  @spec room_exists?(String.t()) :: boolean()
  def room_exists?(room_id) do
    Pids.get_room(room_id) != nil
  end

  @doc """
  Start a room under supervision.
  """
  @spec add_room(String.t()) :: {atom(), pid() | String.t()}
  def add_room(room_id) do
    if !room_exists?(room_id) do
      DynamicSupervisor.start_child(__MODULE__, {Room, room_id})
    else
      {:error, "room already exists for room_id #{room_id}"}
    end
  end

  @doc """
  List current children
  """
  @spec children() :: list()
  def children do
    DynamicSupervisor.which_children(__MODULE__)
  end
end
