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
    Types.Configs.GameServerConfig
  }

  @type id() :: String.t()
  @type game_view() :: [:pregame_lobby | :game_start | :recording | :playback_voting | :game_end]

  typedstruct do
    field(:room_id, id(), enforce: true)
    field(:players, %MapSet{}, default: MapSet.new())
    field(:game_config, %GameServerConfig{})
    field(:game, pid)
  end

  def start_link(args) do
    GenServer.start_link(RoomServer, args)
  end

  @impl true
  def init(args) do
    {room_id, game_config} =
      case args do
        [{room_id}] -> {room_id, %GameServerConfig{}}
        [{room_id, game_config}] -> {room_id, game_config}
      end

    Pids.register({:room_server, room_id}, self())

    {:ok,
     %RoomServer{
       room_id: room_id,
       game_config: game_config
     }}
  end

  @spec add_player(pid(), id()) :: :ok
  def add_player(pid, player) do
    GenServer.call(pid, {:add_player, player})
  end

  @spec drop_player(pid(), id()) :: :ok
  def drop_player(pid, player) do
    GenServer.call(pid, {:drop_player, player})
  end

  @spec get_players(pid()) :: %MapSet{}
  def get_players(pid) do
    GenServer.call(pid, :get_players)
  end

  @impl true
  def handle_call(
        {:add_player, player},
        _from,
        %RoomServer{
          players: players,
          game_config: %GameServerConfig{
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
        {:drop_player, player},
        _from,
        %RoomServer{players: players, room_id: _room_id, game: game} = state
      ) do
    state = %RoomServer{state | players: MapSet.delete(players, player)}

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

  defp start_game(
         %RoomServer{room_id: room_id, players: players, game_config: game_config} = state
       ) do
    # TODO stop casting back and forth from mapset and list between here and new game server
    musicians = MapSet.to_list(players)

    {:ok, game} =
      Supervisor.start_link([{Game, [{room_id, musicians, game_config}]}], strategy: :one_for_one)

    broadcast_start_game(room_id)
    %RoomServer{state | game: game}
  end

  defp broadcast_start_game(room_id) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "start_game", %{})
  end
end
