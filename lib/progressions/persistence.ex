defmodule Progressions.Persistence do
  @moduledoc """
  Provides functions that mimick functionality that will be available once
  application is attached to a real persistence layer.
  """

  use GenServer

  @type id() :: String.t()

  @spec start_link(any) :: :ignore | {:error, any} | {:ok, pid}
  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  @spec init([]) :: {:ok, integer()}
  def init([]) do
    {:ok, 1000}
  end

  @spec gen_serial_id() :: id()
  @doc """
  Generates and returns the next available serial id
  """
  def gen_serial_id do
    GenServer.call(__MODULE__, :next_serial)
  end

  @spec handle_call(:next_serial, {pid(), any()}, integer()) :: {:reply, id(), integer()}
  @impl true
  def handle_call(:next_serial, _from, serial) do
    {:reply, Integer.to_string(serial), serial + 1}
  end
end
