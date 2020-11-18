defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Server,
    Types.Configs.RoomConfig
  }

  @spec start_link(any) :: :ignore | {:error, any} | {:ok, pid}
  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, room_config} =
      case args do
        [{room_id}] -> {room_id, %RoomConfig{}}
        [{room_id, room_config}] -> {room_id, room_config}
      end

    Pids.register({:room, room_id}, self())

    children = [
      {Server, [room_id, room_config.server]}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
