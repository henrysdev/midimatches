defmodule Progressions.Rooms.Room.Musicians.Musician do
  @moduledoc """
  Maintains state and exposes API for interacting with a single musician
  """
  use GenServer

  alias Progressions.{Pids}

  @type musician_state() :: %{
          musician_id: String.t(),
          # TODO use struct for loop
          active_loop: %{},
          potential_loop: %{}
        }

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg)
  end

  @impl true
  def init([musician_id, room_id]) do
    Pids.register({:musician, {musician_id, room_id}}, self())
    {:ok, %{musician_id: musician_id, active_loop: %{}, potential_loop: %{}}}
  end
end
