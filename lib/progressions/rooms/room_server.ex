defmodule Progressions.Rooms.RoomServer do
  @moduledoc """
  Server process that maintains state of room as well as handling room-level
  events such as players joining and leaving.
  """

  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Progressions.{
    Pids,
    Rooms.Room.Game,
    Types.GameRules,
    Types.Player
  }

  @type id() :: String.t()
  @type game_view() :: [:pregame_lobby | :game_start | :recording | :playback_voting | :game_end]

  typedstruct do
    field(:room_id, id(), enforce: true)
    field(:players, MapSet.t(Player), default: MapSet.new())
    field(:game_config, %GameRules{})
    field(:game, pid)
  end

  def start_link(args) do
    GenServer.start_link(RoomServer, args)
  end

  @impl true
  def init(args) do
    {room_id, game_config} =
      case args do
        [{room_id}] -> {room_id, %GameRules{}}
        [{room_id, game_config}] -> {room_id, game_config}
      end

    Pids.register({:room_server, room_id}, self())

    {:ok,
     %RoomServer{
       room_id: room_id,
       game_config: game_config
     }}
  end

  @spec add_player(pid(), %Player{}) :: :ok
  @doc """
  Add a new player to a room
  """
  def add_player(pid, player) do
    GenServer.call(pid, {:add_player, player})
  end

  @spec drop_player(pid(), id()) :: :ok
  @doc """
  Drop a player from a room
  """
  def drop_player(pid, player) do
    GenServer.call(pid, {:drop_player, player})
  end

  @spec get_players(pid()) :: MapSet.t(Player)
  @doc """
  Return all players that are in a room
  """
  def get_players(pid) do
    GenServer.call(pid, :get_players)
  end

  @spec reset_game(pid()) :: :ok
  @doc """
  Reset the current game by stopping and restarting
  """
  def reset_game(pid) do
    GenServer.call(pid, :reset_game)
  end

  @impl true
  def handle_call(
        {:add_player, player},
        _from,
        %RoomServer{
          players: players,
          game_config: %GameRules{
            game_size_num_players: num_players_to_start
          },
          game: game
        } = state
      ) do
    players = MapSet.put(players, player)
    state = %RoomServer{state | players: players}

    enough_players_to_start? = MapSet.size(players) == num_players_to_start
    free_for_new_game? = is_nil(game)

    case {enough_players_to_start?, free_for_new_game?} do
      {true, true} ->
        state = start_game(state)
        {:reply, state, state}

      {true, false} ->
        # TODO waiting queue for next game [?]
        {:reply, state, state}

      {false, _} ->
        {:reply, state, state}
    end
  end

  @impl true
  def handle_call(
        {:drop_player, player_id},
        _from,
        %RoomServer{players: players, room_id: _room_id, game: game} = state
      ) do
    state = %RoomServer{state | players: MapSet.delete(players, player_id)}

    if is_nil(game) do
      # TODO comm with game_server: player has dropped, replace with bot
      {:reply, state, state}
    else
      {:reply, state, state}
    end
  end

  @impl true
  def handle_call(:get_players, _from, %RoomServer{players: players} = state) do
    {:reply, players, state}
  end

  @impl true
  def handle_call(
        :reset_game,
        _from,
        %RoomServer{game: game, room_id: room_id, game_config: game_config} = state
      ) do
    Game.stop_game(game)

    # reset all room state besides id and config
    state = %RoomServer{
      room_id: room_id,
      game_config: game_config,
    }

    broadcast_reset_game(state)

    {:reply, state, state}
  end

  @spec start_game(%RoomServer{}) :: %RoomServer{}
  defp start_game(
         %RoomServer{room_id: room_id, players: players, game_config: game_config} = state
       ) do
    {:ok, game} =
      Supervisor.start_link([{Game, [{room_id, players, game_config}]}], strategy: :one_for_one)

    %RoomServer{state | game: game}
  end

  @spec broadcast_reset_game(%RoomServer{}) :: atom()
  defp broadcast_reset_game(%RoomServer{room_id: room_id} = state) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "reset_game", %{})
  end
end
