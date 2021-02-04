defmodule Progressions.Rooms.Room do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.RoomServer,
    Types.Configs.RoomConfig
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, room_name, room_config} =
      case args do
        [{room_id, room_name}] ->
          {room_id, room_name, %RoomConfig{room_name: room_name}}

        [{room_id, room_name, room_config}] ->
          {room_id, room_name, %RoomConfig{room_config | room_name: room_name}}
      end

    Pids.register({:room, room_id}, self())

    children = [
      {RoomServer, [{room_id, room_name, room_config.server}]}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
