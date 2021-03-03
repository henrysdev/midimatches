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
    field(:start_game_deadline, number(), default: -1)
    field(:primed_to_start, boolean(), default: true)
    field(:created_at, number(), default: -1)
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
       game_config: game_config,
       created_at: :os.system_time(:millisecond)
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

  @spec full?(pid()) :: boolean()
  @doc """
  Return true if room is at max capacity of players
  """
  def full?(pid) do
    GenServer.call(pid, :full?)
  end

  @spec stale?(pid(), number()) :: boolean()
  @doc """
  Return true if room has not been used in awhile
  """
  def stale?(pid, freshness_cutoff) do
    GenServer.call(pid, {:stale?, freshness_cutoff})
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
    valid_player_to_drop? =
      players
      |> MapSet.to_list()
      |> Enum.any?(&(&1.player_id == player_id))

    if valid_player_to_drop? do
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
    else
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
            min_players: min_players_to_start
          },
          room_id: room_id,
          game: game,
          primed_to_start: primed_to_start
        } = state
      ) do
    room_players = MapSet.put(players, player)
    state = %RoomServer{state | players: room_players}

    state =
      if is_nil(game) do
        broadcast_lobby_state(state)

        if MapSet.size(room_players) >= min_players_to_start and primed_to_start == true do
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
        :full?,
        _from,
        %RoomServer{
          players: players,
          # TODO have a room config and use this max_players, could be diff from game max_players
          game_config: %GameRules{
            max_players: max_players
          }
        } = state
      ) do
    {:reply, MapSet.size(players) == max_players, state}
  end

  @impl true
  def handle_call(
        {:stale?, freshness_cutoff},
        _from,
        %RoomServer{
          players: players,
          game: game,
          start_game_deadline: start_game_deadline,
          created_at: created_at,
          game_config: %GameRules{
            permanent_room: permanent_room
          }
        } = state
      ) do
    # last_activity_timestamp = max(created_at, start_game_deadline)

    cond do
      permanent_room ->
        {:reply, false, state}

      MapSet.size(players) == 0 and is_nil(game) and
          max(created_at, start_game_deadline) < freshness_cutoff ->
        {:reply, true, state}

      true ->
        {:reply, false, state}
    end

    # if MapSet.size(players) == 0 and is_nil(game) and last_activity_timestamp < freshness_cutoff do
    #   {:reply, true, state}
    # else
    #   {:reply, false, state}
    # end
  end

  @impl true
  def handle_call(
        :reset_room,
        _from,
        %RoomServer{
          game: game,
          room_id: room_id,
          room_name: room_name,
          game_config:
            %GameRules{
              pregame_countdown: pregame_countdown
            } = game_config
        }
      ) do
    Game.stop_game(game)

    state = %RoomServer{
      room_id: room_id,
      room_name: room_name,
      game_config: game_config,
      start_game_deadline: Utils.calc_future_timestamp(pregame_countdown),
      primed_to_start: false
    }

    broadcast_reset_room(state)

    room_pid = self()

    spawn(fn ->
      Process.sleep(pregame_countdown)
      send(room_pid, :advance_to_game)
      nil
    end)

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

  @impl true
  def handle_info(
        :advance_to_game,
        %RoomServer{
          players: players,
          game_config: %GameRules{
            min_players: min_players_to_start
          },
          game: game
        } = state
      ) do
    state = %RoomServer{state | primed_to_start: true}

    state =
      if is_nil(game) and MapSet.size(players) >= min_players_to_start do
        broadcast_lobby_state(state)
        start_game(state)
      else
        state
      end

    {:noreply, state}
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
  defp broadcast_reset_room(%RoomServer{room_id: room_id} = state) do
    MidimatchesWeb.Endpoint.broadcast("room:#{room_id}", "reset_room", %{
      room_state: Utils.server_to_client_room_state(state)
    })
  end

  @spec broadcast_lobby_state(%RoomServer{}) :: atom()
  defp broadcast_lobby_state(%RoomServer{room_id: room_id} = state) do
    MidimatchesWeb.Endpoint.broadcast(
      "room:#{room_id}",
      "lobby_update",
      %{room_state: Utils.server_to_client_room_state(state)}
    )
  end
end
