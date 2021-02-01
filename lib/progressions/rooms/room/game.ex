defmodule Progressions.Rooms.Room.Game do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameServer,
    Types.GameRules
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, players, game_config} =
      case args do
        [{room_id, players}] -> {room_id, players, %GameRules{}}
        [{room_id, players, room_config}] -> {room_id, players, room_config}
      end

    Pids.register({:game_supervisor, room_id}, self())

    children = [
      {ViewTimer, [{room_id}]},
      {GameServer, [{room_id, players, game_config}]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
