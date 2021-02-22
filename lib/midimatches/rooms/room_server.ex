defmodule Midimatches.Rooms.RoomServer do
  @moduledoc """
  Server process that maintains state of room as well as handling room-level
  events such as players joining and leaving.
  """

  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Rooms.Room.Game,
    Rooms.Room.GameServer,
    Types.GameRules,
    Types.Player,
    Utils
  }

  @type id() :: String.t()
  @type game_view() :: [:pregame_lobby | :game_start | :recording | :playback_voting | :game_end]

  typedstruct do
    field(:room_id, id(), enforce: true)
    field(:room_name, String.t(), enforce: true)
    field(:players, MapSet.t(Player), default: MapSet.new())
    field(:game_config, %GameRules{}, default: %GameRules{})
    field(:game, pid, default: nil)
  end

  def start_link(args) do
    GenServer.start_link(RoomServer, args)
  end

  @impl true
  def init(args) do
    {room_id, room_name, game_config} =
      case args do
        [{room_id, room_name}] -> {room_id, room_name, %GameRules{}}
        [{room_id, room_name, game_config}] -> {room_id, room_name, game_config}
      end

    Pids.register({:room_server, room_id}, self())

    {:ok,
     %RoomServer{
       room_id: room_id,
       room_name: room_name,
       game_config: game_config
     }}
  end

  @spec add_player(pid(), %Player{}) :: %RoomServer{}
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
    GenServer.cast(pid, {:drop_player, player})
  end

  @spec get_players(pid()) :: MapSet.t(Player)
  @doc """
  Return all players that are in a room
  """
  def get_players(pid) do
    GenServer.call(pid, :get_players)
  end

  @spec reset_room(pid()) :: :ok
  @doc """
  Reset the current game by stopping and restarting
  """
  def reset_room(pid) do
    GenServer.call(pid, :reset_room)
  end

  @spec sync_lobby_state(pid()) :: :ok
  @doc """
  Update clients with most recent lobby state
  """
  def sync_lobby_state(pid) do
    GenServer.call(pid, :sync_lobby_state)
  end

  @impl true
  def handle_cast(
        {:drop_player, player_id},
        # _from,
        %RoomServer{players: players, game: game, room_id: room_id} = state
      ) do
    state = %RoomServer{
      state
      | players:
          players
          |> MapSet.to_list()
          |> Enum.reject(&(&1.player_id == player_id))
          |> MapSet.new()
    }

    if is_nil(game) do
      broadcast_lobby_state(state)
      {:noreply, state}
    else
      game_server = Pids.fetch!({:game_server, room_id})
      GameServer.drop_player(game_server, player_id)
      {:noreply, state}
    end
  end

  @impl true
  def handle_call(
        {:add_player, player},
        _from,
        %RoomServer{
          players: players,
          game_config: %GameRules{
            min_players: num_players_to_start
          },
          room_id: room_id,
          game: game
        } = state
      ) do
    room_players = MapSet.put(players, player)
    state = %RoomServer{state | players: room_players}

    state =
      if is_nil(game) do
        enough_players_to_start? = MapSet.size(room_players) == num_players_to_start
        broadcast_lobby_state(state)

        if enough_players_to_start? do
          start_game(state)
        else
          state
        end
      else
        game_server = Pids.fetch!({:game_server, room_id})
        GameServer.add_player(game_server, player)
        state
      end

    {:reply, state, state}
  end

  @impl true
  def handle_call(:get_players, _from, %RoomServer{players: players} = state) do
    {:reply, players, state}
  end

  @impl true
  def handle_call(
        :reset_room,
        _from,
        %RoomServer{game: game, room_id: room_id, room_name: room_name, game_config: game_config}
      ) do
    Game.stop_game(game)

    state = %RoomServer{
      room_id: room_id,
      room_name: room_name,
      game_config: game_config
    }

    broadcast_reset_room(state)
    broadcast_lobby_state(state)

    {:reply, state, state}
  end

  @impl true
  def handle_call(
        :sync_lobby_state,
        _from,
        %RoomServer{} = state
      ) do
    broadcast_lobby_state(state)

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

  @spec broadcast_reset_room(%RoomServer{}) :: atom()
  defp broadcast_reset_room(%RoomServer{room_id: room_id}) do
    MidimatchesWeb.Endpoint.broadcast("room:#{room_id}", "reset_room", %{})
  end

  @spec broadcast_lobby_state(%RoomServer{}) :: atom()
  defp broadcast_lobby_state(%RoomServer{room_id: room_id} = state) do
    MidimatchesWeb.Endpoint.broadcast(
      "room:#{room_id}",
      "lobby_update",
      Utils.server_to_client_room_state(state)
    )
  end
end
