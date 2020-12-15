# defmodule Progressions.Rooms.Room.ServerAPI do
#   @moduledoc """
#   API for interacting with a Server genserver process
#   """
#   require Logger

#   alias Progressions.{
#     Types.Loop,
#     Types.Musician
#   }

#   @type id() :: String.t()

#   @spec get_musicians(pid()) :: [%Musician{}]
#   @doc """
#   Get musician ids
#   """
#   def get_musicians(pid) do
#     GenServer.call(pid, :get_musicians)
#   end

#   @spec get_start_time(pid()) :: integer()
#   @doc """
#   Get start time of room in UTC microseconds
#   """
#   def get_start_time(pid) do
#     GenServer.call(pid, :get_start_time)
#   end

#   @spec add_musician(pid(), %Musician{}) :: :ok
#   @doc """
#   Add a new musician to the room
#   """
#   def add_musician(pid, %Musician{} = musician) do
#     GenServer.cast(pid, {:add_musician, musician})
#   end

#   @spec update_musician_loop(pid(), id(), %Loop{}) :: :ok
#   @doc """
#   TODO DEPRECATE - use update_musician
#   Update given musician with a new loop
#   """
#   def update_musician_loop(pid, musician_id, %Loop{} = loop) do
#     GenServer.cast(pid, {:update_musician_loop, loop, musician_id})
#   end

#   @spec update_musician(pid(), id(), map()) :: :ok
#   @doc """
#   Update given musician by merging given change map
#   """
#   def update_musician(pid, musician_id, %{} = change_map) when is_map(change_map) do
#     GenServer.cast(pid, {:update_musician, musician_id, change_map})
#   end
# end
