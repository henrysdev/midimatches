defmodule Progressions.Rooms.Room.GameServer do
  @moduledoc """
  The game logic for the game server represented as an event-driven state machine
  """
  use GenStateMachine
  use TypedStruct

  alias Progressions.{
    Pids,
    Types.Configs.GameServerConfig,
    Types.Loop,
    Types.Musician,
    Utils
  }

  require Logger

  @type id() :: String.t()
  @type game_view() :: [:pregame_lobby | :game_start | :recording | :playback_voting | :game_end]

  typedstruct do
    # server life cycle state
    field(:room_id, String.t(), enforce: true)
    field(:round_recording_start_time, integer(), enforce: true)
    field(:timestep_size, integer(), enforce: true)
    field(:quantization_threshold, float(), enforce: true)
    field(:rounds_to_win, integer(), enforce: true)
    field(:game_size_num_players, integer(), enforce: true)
    field(:solo_time_limit, integer(), enforce: true)
    field(:contestants_per_round, integer(), enforce: true)

    # game life cycle state
    field(:musicians, %{required(id()) => %Musician{}}, default: %{})
    field(:round, integer(), default: 0)
    field(:scores, %{required(id()) => integer()}, default: %{})
    field(:winner, id())

    # round life cycle state
    field(:ready_ups, %{required(id()) => boolean()}, default: %{})
    field(:recordings, %{required(id()) => %Loop{}}, default: %{})
    field(:votes, %{required(id()) => id()}, default: %{})
  end

  def start_link(args) do
    GenStateMachine.start_link(__MODULE__, args)
  end

  def init(args) do
    {room_id, server_config} =
      case args do
        [room_id] -> {room_id, %GameServerConfig{}}
        [room_id, server_config] -> {room_id, server_config}
      end

    Pids.register({:game_server, room_id}, self())

    data = %__MODULE__{
      room_id: room_id,
      round_recording_start_time: :os.system_time(:microsecond),
      timestep_size: server_config.timestep_size,
      quantization_threshold: server_config.quantization_threshold,
      game_size_num_players: server_config.game_size_num_players,
      rounds_to_win: server_config.rounds_to_win,
      solo_time_limit: server_config.solo_time_limit,
      contestants_per_round: server_config.contestants_per_round
    }

    {:ok, :pregame_lobby, data}
  end

  ## Event Callbacks

  # Get current game view
  def handle_event(
        {:call, from},
        :current_view,
        view,
        data
      ) do
    {:next_state, view, data, [{:reply, from, view}]}
  end

  def handle_event(
        {:call, from},
        {:drop_musician, musician_id},
        :pregame_lobby,
        %__MODULE__{
          musicians: musicians,
          scores: scores,
          ready_ups: ready_ups,
          votes: votes,
          recordings: recordings
        } = data
      ) do
    updated_musicians = Map.delete(musicians, musician_id)
    updated_scores = Map.delete(scores, musician_id)
    updated_ready_ups = Map.delete(ready_ups, musician_id)
    updated_votes = Map.delete(votes, musician_id)
    updated_recordings = Map.delete(recordings, musician_id)

    updated_data = %__MODULE__{
      data
      | musicians: updated_musicians,
        scores: updated_scores,
        ready_ups: updated_ready_ups,
        votes: updated_votes,
        recordings: updated_recordings
    }

    {:next_state, :pregame_lobby, updated_data,
     [{:reply, from, sync_across_clients(:pregame_lobby, updated_data)}]}
  end

  # Game View: Pregame Lobby
  def handle_event(
        {:call, from},
        {:add_musician, %Musician{musician_id: musician_id} = musician},
        :pregame_lobby,
        %__MODULE__{
          musicians: musicians,
          game_size_num_players: game_size_num_players
        } = data
      ) do
    updated_musicians = Map.put(musicians, musician_id, musician)
    enough_musicians_to_start? = length(Map.keys(updated_musicians)) == game_size_num_players

    updated_data = %__MODULE__{
      data
      | musicians: updated_musicians
    }

    if enough_musicians_to_start? do
      # progress to game start
      init_scores =
        updated_musicians
        |> Map.keys()
        |> Enum.reduce(%{}, &Map.put(&2, &1, 0))

      updated_data = %__MODULE__{updated_data | scores: init_scores}

      {:next_state, :game_start, updated_data,
       [{:reply, from, sync_across_clients(:game_start, updated_data)}]}
    else
      # wait for more musicians to join
      {:next_state, :pregame_lobby, updated_data,
       [{:reply, from, sync_across_clients(:pregame_lobby, updated_data)}]}
    end
  end

  # Game View: Game Start
  def handle_event(
        {:call, from},
        {:ready_up, musician_id},
        :game_start,
        %__MODULE__{musicians: musicians, ready_ups: ready_ups} = data
      ) do
    valid_ready_up? =
      Map.has_key?(musicians, musician_id) and !Map.has_key?(ready_ups, musician_id)

    enough_ready_ups? = length(Map.keys(ready_ups)) == length(Map.keys(musicians)) - 1

    case {valid_ready_up?, enough_ready_ups?} do
      # valid ready up - store ready up in game server state
      {true, false} ->
        updated_data = %__MODULE__{data | ready_ups: Map.put(ready_ups, musician_id, true)}

        {:next_state, :game_start, updated_data,
         [{:reply, from, sync_across_clients(:game_start, updated_data)}]}

      # last needed ready up - reset ready ups and transition to next game server state
      {true, true} ->
        updated_data = %__MODULE__{
          data
          | ready_ups: %{},
            round_recording_start_time: :os.system_time(:microsecond)
        }

        {:next_state, :recording, updated_data,
         [{:reply, from, sync_across_clients(:recording, updated_data)}]}

      # invalid ready up - game server state unchanged
      _ ->
        {:next_state, :game_start, data, [{:reply, from, data}]}
    end
  end

  # Game View: Recording
  def handle_event(
        {:call, from},
        {:record, musician_id, %Loop{} = recording},
        :recording,
        %__MODULE__{musicians: musicians, recordings: recordings} = data
      ) do
    valid_recording? =
      Map.has_key?(musicians, musician_id) and !Map.has_key?(recordings, musician_id)

    enough_recordings? = length(Map.keys(recordings)) == length(Map.keys(musicians)) - 1

    case {valid_recording?, enough_recordings?} do
      # valid recording - store recording in game server state
      {true, false} ->
        updated_data = %__MODULE__{data | recordings: Map.put(recordings, musician_id, recording)}

        {:next_state, :recording, updated_data,
         [{:reply, from, sync_across_clients(:recording, updated_data)}]}

      # last needed recording - store recording and transition to playback voting server state
      {true, true} ->
        updated_data = %__MODULE__{data | recordings: Map.put(recordings, musician_id, recording)}

        {:next_state, :playback_voting, updated_data,
         [{:reply, from, sync_across_clients(:playback_voting, updated_data)}]}

      # invalid recording - game server state unchanged
      _ ->
        {:next_state, :recording, data, [{:reply, from, data}]}
    end
  end

  # Game View: Playback Voting
  def handle_event(
        {:call, from},
        {:vote, musician_id, vote},
        :playback_voting,
        %__MODULE__{
          musicians: musicians,
          recordings: recordings,
          votes: votes,
          scores: scores,
          round: round,
          rounds_to_win: rounds_to_win
        } = data
      ) do
    valid_vote? =
      Map.has_key?(musicians, musician_id) and Map.has_key?(recordings, vote) and
        !Map.has_key?(votes, musician_id) and musician_id != vote

    enough_votes? = length(Map.keys(votes)) == length(Map.keys(musicians)) - 1

    case {valid_vote?, enough_votes?} do
      # valid vote - store vote in game server state
      {true, false} ->
        updated_data = %__MODULE__{data | votes: Map.put(votes, musician_id, vote)}

        {:next_state, :playback_voting, updated_data,
         [{:reply, from, sync_across_clients(:playback_voting, updated_data)}]}

      # last needed vote - calculate score and transition to next round or game end
      {true, true} ->
        [round_winner] =
          votes
          |> Map.put(musician_id, vote)
          |> Map.values()
          |> Enum.frequencies()
          |> Map.to_list()
          |> Enum.sort_by(fn {_, freq} -> freq end, :desc)
          |> Enum.map(fn {musician_id, _freq} -> musician_id end)
          |> Enum.take(1)

        updated_scores = Map.update(scores, round_winner, 1, &(&1 + 1))

        if Map.get(updated_scores, round_winner) >= rounds_to_win do
          # game has been won by round winner
          updated_data = %__MODULE__{
            data
            | votes: %{},
              scores: updated_scores,
              winner: round_winner
          }

          {:next_state, :game_end, updated_data,
           [{:reply, from, sync_across_clients(:game_end, updated_data)}]}
        else
          # continue to next round
          updated_data = %__MODULE__{
            data
            | votes: %{},
              scores: updated_scores,
              recordings: %{},
              round: round + 1
          }

          {:next_state, :recording, updated_data,
           [{:reply, from, sync_across_clients(:recording, updated_data)}]}
        end

      # invalid vote - game server state unchanged
      _ ->
        {:next_state, :playback_voting, data, [{:reply, from, data}]}
    end
  end

  # Game View: Game End
  def handle_event(:cast, :next_state, :game_end, %__MODULE__{winner: _winner} = data) do
    {:next_state, :game_end, data}
  end

  # Catchall for debug

  def handle_event({:call, from}, params, state, data) do
    Logger.warn(
      {:CATCHALL_CLAUSE_DEBUG, %{from: from, params: params, state: state, data: data}}
      |> inspect(pretty: true)
    )

    {:next_state, state, data, [{:reply, from, data}]}
  end

  ## Helpers

  defp sync_across_clients(view, %__MODULE__{room_id: room_id} = game_server_data)
       when is_atom(view) do
    ProgressionsWeb.Endpoint.broadcast("room:#{room_id}", "view_update", %{
      view: view,
      game_state: Utils.server_to_client_game_state(game_server_data)
    })

    game_server_data
  end
end
