defmodule Progressions.Rooms.Room.Game do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Progressions.{
    Pids,
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameServer,
    Types.GameRules,
    Utils
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

    # assign game a unique id
    game_id = Utils.gen_random_string(16)

    children = [
      {ViewTimer, [{room_id}]},
      {GameServer, [{room_id, game_id, players, game_config}]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec stop_game(pid()) :: atom()
  @doc """
  Gracefully shut down a game supervisor and its children
  """
  def stop_game(pid), do: Supervisor.stop(pid)
end
