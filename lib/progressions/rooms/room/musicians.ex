defmodule Progressions.Rooms.Room.Musicians do
  @moduledoc """
  Dynamic supervisor for musicians in a room
  """
  use DynamicSupervisor

  alias Progressions.{
    Rooms.Room.Musicians.Musician,
    Pids
  }

  @type id() :: String.t()

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg)
  end

  @impl true
  def init([room_id]) do
    Pids.register({:musicians, room_id}, self())
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @doc """
  Check if a musician process exists for the given id
  """
  @spec musician_exists?(id(), id()) :: boolean()
  def musician_exists?(musician_id, room_id) do
    Pids.fetch({:musician, {musician_id, room_id}}) != nil
  end

  @doc """
  Start a musician under supervision.
  """
  @spec add_musician(pid(), id(), id()) :: {atom(), pid() | String.t()}
  def add_musician(pid, musician_id, room_id) do
    if musician_exists?(musician_id, room_id) do
      {:error, "musician already exists for musician_id #{musician_id} in room #{room_id}"}
    else
      DynamicSupervisor.start_child(pid, {Musician, [musician_id, room_id]})
    end
  end

  @doc """
  List all musician child processes
  """
  @spec list_musicians(pid()) :: list()
  def list_musicians(pid) do
    DynamicSupervisor.which_children(pid)
  end
end
