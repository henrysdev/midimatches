defmodule Progressions.Rooms.RoomServer do
  @moduledoc """
  Server process that maintains state of room as well as handling room-level
  events such as players joining and leaving.
  """

  use GenServer
  use TypedStruct

  alias __MODULE__

  alias Progressions.Pids

  @type id() :: String.t()
  @type game_view() :: [:pregame_lobby | :game_start | :recording | :playback_voting | :game_end]

  typedstruct do
    # server life cycle state
    field(:room_id, id(), enforce: true)
    field(:players, %MapSet{}, default: MapSet.new())
    # TODO actual game config type
    field(:game_config, %{})
  end

  def start_link(args) do
    GenServer.start_link(RoomServer, args)
  end

  @impl true
  def init(args) do
    {room_id, _config} =
      case args do
        # TODO any actual config to parse?
        [room_id] -> {room_id, %{}}
        [room_id, server_config] -> {room_id, server_config}
      end

    Pids.register({:room_server, room_id}, self())

    {:ok,
     %RoomServer{
       room_id: room_id
     }}
  end

  # TODO move to API module[?]
  @spec add_player(pid(), id()) :: :ok
  def add_player(pid, player) do
    GenServer.cast(pid, {:add_player, player})
  end

  @spec drop_player(pid(), id()) :: :ok
  def drop_player(pid, player) do
    GenServer.cast(pid, {:drop_player, player})
  end

  @spec get_players(pid()) :: %MapSet{}
  def get_players(pid) do
    GenServer.call(pid, :get_players)
  end

  @impl true
  def handle_cast(
        {:add_player, player},
        %RoomServer{players: players} = state
      ) do
    # TODO comm with game_server: start a game
    players = MapSet.put(players, player)
    {:noreply, %RoomServer{state | players: players}}
  end

  @impl true
  def handle_cast(
        {:drop_player, player},
        %RoomServer{players: players} = state
      ) do
    # TODO comm with game_server: player has dropped, start a bot
    {:noreply, %RoomServer{state | players: MapSet.delete(players, player)}}
  end

  @impl true
  def handle_call(:get_players, _from, %RoomServer{players: players} = state) do
    {:reply, players, state}
  end
end
