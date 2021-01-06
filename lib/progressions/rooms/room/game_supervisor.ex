defmodule Progressions.Rooms.Room.GameSupervisor do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.GameServer,
    Types.Configs.GameServerConfig
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, game_config} =
      case args do
        [{room_id}] -> {room_id, %GameServerConfig{}}
        [{room_id, room_config}] -> {room_id, room_config}
      end

    Pids.register({:game_supervisor, room_id}, self())

    children = [{GameServer, [room_id, game_config]}]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
