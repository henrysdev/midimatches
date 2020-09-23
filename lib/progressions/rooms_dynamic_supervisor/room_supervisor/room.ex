defmodule Progressions.Room do
  use GenServer

  alias Progressions.{Pids}

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id)
  end

  @impl true
  def init(room_id) do
    Pids.register_room(room_id, self())
    {:ok, room_id}
  end

  def broadcast(_pid) do
    # TODO implement
  end
end
