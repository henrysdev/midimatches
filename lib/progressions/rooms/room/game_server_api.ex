defmodule Progressions.Rooms.Room.GameServerAPI do
  @moduledoc """
  API for interacting with a Server genserver process
  """
  require Logger

  alias Progressions.{
    Pids,
    Rooms.Room.GameServer,
    Types.Configs.ServerConfig,
    Types.Loop,
    Types.Musician
  }

  @type id() :: String.t()

  def start_game_server(room_id, %ServerConfig{} = config \\ %ServerConfig{}) do
    {:ok, game_server} =
      GenStateMachine.start_link(
        GameServer,
        {:pregame_lobby,
         %GameServer{
           room_id: room_id,
           room_start_utc: :os.system_time(:microsecond),
           timestep_us: config.timestep_us,
           quantization_threshold: config.quantization_threshold,
           musicians: %{}
         }}
      )

    Pids.register({:server, room_id}, game_server)

    {:ok, game_server}
  end

  @spec get_current_view(pid()) :: atom()
  @doc """
  Get the current game view
  """
  def get_current_view(pid) do
    GenStateMachine.call(pid, :current_view)
  end

  @spec add_musician(pid(), %Musician{}) :: :ok
  @doc """
  Add a new musician to the game. Currently only adds the musician if game server is in pregame
  lobby state.
  """
  def add_musician(pid, %Musician{} = musician) do
    GenStateMachine.call(pid, {:add_musician, musician})
  end

  @spec musician_ready_up(pid(), id()) :: :ok
  @doc """
  Ready up a musician in the game. All ready ups from active musicians required to progress
  state from game start to recording
  """
  def musician_ready_up(pid, musician_id) do
    GenStateMachine.call(pid, {:ready_up, musician_id})
  end

  @spec musician_recording(pid(), id(), %Loop{}) :: :ok
  @doc """
  Collect a recording for a musician in the game. Recordings from all musicians required to progress
  state from recording to playback voting
  """
  def musician_recording(pid, musician_id, %Loop{} = recording) do
    GenStateMachine.call(pid, {:record, musician_id, recording})
  end

  @spec musician_vote(pid(), id(), id()) :: :ok
  @doc """
  Collect a vote for a musician recording. Votes from all musicians required to progress
  state from recording to recording
  """
  def musician_vote(pid, musician_id, vote) do
    GenStateMachine.call(pid, {:vote, musician_id, vote})
  end
end
