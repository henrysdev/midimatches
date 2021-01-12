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
    {room_id, musicians, game_config} =
      case args do
        [{room_id, musicians}] -> {room_id, musicians, %GameRules{}}
        [{room_id, musicians, room_config}] -> {room_id, musicians, room_config}
      end

    Pids.register({:game_supervisor, room_id}, self())

    children = [
      {GameServer, [{room_id, musicians, game_config}]},
      {ViewTimer, [{room_id}]}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
