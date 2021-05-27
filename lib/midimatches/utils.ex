defmodule Midimatches.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Midimatches.{
    Pids,
    Rooms.Room.GameInstance,
    Rooms.RoomServer,
    Types.ClientGameState,
    Types.ClientRoomGameJoin,
    Types.ClientRoomState,
    Types.ClientUser,
    Types.GameRecord,
    Types.Loop,
    Types.Note,
    Types.Player,
    Types.PlayerOutcome,
    Types.PlayerRecording,
    Types.RoundRecord,
    Types.TimestepSlice,
    Types.User,
    Types.WinResult
  }

  alias MidimatchesDb, as: Db

  @type id() :: String.t()
  @type freq_pair() :: {id(), number()}
  @type event_type() :: :game | :round

  @spec build_win_result(list(freq_pair)) :: %WinResult{}
  def build_win_result(freq_list) when freq_list == [] do
    max_votes = 0

    %WinResult{
      winners: [],
      num_points: max_votes
    }
  end

  def build_win_result(freq_list) do
    {_id, max_votes} = Enum.max_by(freq_list, fn {_id, freq} -> freq end)

    %WinResult{
      winners:
        freq_list
        |> Stream.filter(fn {_id, freq} -> freq == max_votes end)
        |> Enum.map(fn {id, _freq} -> id end),
      num_points: max_votes
    }
  end

  @spec gen_uuid() :: String.t()
  @doc """
  Generate a unique identifier
  """
  def gen_uuid, do: UUID.uuid4()

  @spec server_to_client_game_state(%GameInstance{}) :: any
  @doc """
  Transform game server state into update payload for clients
  """
  def server_to_client_game_state(%GameInstance{} = server_state) do
    # votes are secret - should not expose actual votes to clients, only progress on
    # voting as a whole
    num_votes_cast =
      server_state.votes
      |> Map.keys()
      |> length()

    players_list =
      server_state.players
      |> MapSet.to_list()

    ready_ups_list =
      server_state.ready_ups
      |> MapSet.to_list()

    recordings_list =
      server_state.recordings
      |> Map.to_list()
      |> Enum.shuffle()
      |> Enum.sort_by(&(elem(&1, 1).timestep_slices |> length() == 0), :asc)
      |> Enum.map(&Tuple.to_list(&1))

    scores_list =
      server_state.scores
      |> Map.to_list()
      |> Enum.map(&Tuple.to_list(&1))

    %ClientGameState{
      # static fields
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,

      # dynamic fields
      game_view: server_state.game_view,
      players: players_list,
      num_votes_cast: num_votes_cast,
      ready_ups: ready_ups_list,
      recordings: recordings_list,
      round_recording_start_time: server_state.round_recording_start_time,
      game_winners: server_state.game_winners,
      contestants: server_state.contestants,
      scores: scores_list,
      round_num: server_state.round_num,
      round_winners: server_state.round_winners,
      sample_beats: server_state.sample_beats,
      view_deadline: server_state.view_deadline
    }
  end

  @spec server_to_client_room_state(%RoomServer{}) :: any
  @doc """
  Transform room server state into update payload for clients
  """
  def server_to_client_room_state(%RoomServer{} = server_state) do
    %ClientRoomState{
      room_id: server_state.room_id,
      room_name: server_state.room_name,
      game_rules: server_state.game_config,
      # TODO stop sending as it can be figured out from room_players
      num_curr_players: MapSet.size(server_state.players),
      in_game: !is_nil(server_state.game),
      start_game_deadline: server_state.start_game_deadline,
      room_players: MapSet.to_list(server_state.players)
    }
  end

  @spec server_room_to_client_room_game_join(%RoomServer{}) :: map()
  @doc """
  Transform room server state into a joined room and game client payload
  """
  def server_room_to_client_room_game_join(%RoomServer{room_id: room_id} = room_state) do
    client_room_state =
      room_state
      |> server_to_client_room_state()
      |> Map.from_struct()

    client_game_state =
      if client_room_state.in_game do
        {:game_server, room_id}
        |> Pids.fetch!()
        |> :sys.get_state()
        |> server_to_client_game_state()
        |> Map.from_struct()
      else
        %ClientGameState{}
      end

    %ClientRoomGameJoin{
      room_state: client_room_state,
      game_state: client_game_state
    }
  end

  @spec curr_utc_timestamp() :: integer()
  @doc """
  Calculate the current utc millisecond timestamp
  """
  def curr_utc_timestamp do
    :os.system_time(:millisecond)
  end

  @spec calc_future_timestamp(integer(), integer()) :: integer()
  @doc """
  Calculate the correct utc millisecond timestamp. Uses milliseconds after current
  timestamp by default.
  """
  def calc_future_timestamp(millis_in_future, curr \\ curr_utc_timestamp())
      when is_nil(millis_in_future) == false do
    curr + millis_in_future
  end

  @spec user_to_player(%User{}) :: %Player{}
  @doc """
  Transforms a user struct to a player struct
  """
  def user_to_player(%User{
        user_id: user_id,
        user_alias: user_alias
      }) do
    %Player{
      player_id: user_id,
      player_alias: user_alias
    }
  end

  @spec server_to_client_user(%User{}) :: %ClientUser{}
  @doc """
  Transforms a user struct to a client user struct (filters out metadata fields)
  """
  def server_to_client_user(%User{
        user_id: user_id,
        user_alias: user_alias,
        registered?: registered?
      }) do
    %ClientUser{
      user_id: user_id,
      user_alias: user_alias,
      registered: registered?
    }
  end

  @spec calc_sample_time(integer()) :: integer()
  @doc """
  Calculate the sample time for a sample in milliseconds
  """
  def calc_sample_time(bpm) do
    floor(60 / bpm * 4 * 4 * 1000)
  end

  @spec user_to_db_user(%User{}) :: %Db.User{}
  @doc """
  Cast a user struct to a db user struct
  """
  def user_to_db_user(%User{
        user_id: user_id,
        user_alias: user_alias
      }) do
    %Db.User{
      uuid: user_id,
      username: user_alias
    }
  end

  @spec db_user_to_user(%Db.User{}) :: %User{}
  @doc """
  Cast a db user struct to a user struct
  """
  def db_user_to_user(%Db.User{uuid: uuid, username: username, registered: registered}) do
    %User{
      user_id: uuid,
      user_alias: username,
      registered?: registered
    }
  end

  @spec game_record_to_db_game_record(%GameRecord{}) :: %Db.GameRecord{}
  @doc """
  Cast a game record to a db game record
  """
  def game_record_to_db_game_record(%GameRecord{game_end_reason: game_end_reason}) do
    %Db.GameRecord{
      game_end_reason: game_end_reason
    }
  end

  @spec round_record_to_db_round_record(%RoundRecord{}) :: %Db.RoundRecord{}
  @doc """
  Cast a round record to a db round record
  """
  def round_record_to_db_round_record(%RoundRecord{
        round_num: round_num,
        backing_track_id: backing_track_id
      }) do
    %Db.RoundRecord{
      round_num: round_num,
      backing_track_uuid: backing_track_id
    }
  end

  @spec player_outcome_to_db_player_outcome(%PlayerOutcome{}, event_type(), id()) ::
          %Db.PlayerOutcome{}
  @doc """
  Cast a player outcome to a db player outcome
  """
  def player_outcome_to_db_player_outcome(
        %PlayerOutcome{
          player_id: player_uuid,
          outcome: outcome,
          num_points: num_points
        },
        event_type,
        event_id
      )
      when event_type in [:round, :game] do
    %Db.PlayerOutcome{
      player_uuid: player_uuid,
      outcome: outcome,
      num_points: num_points,
      event_type: event_type,
      event_id: event_id
    }
  end

  @spec player_recording_to_db_player_recording(%PlayerRecording{}, event_type(), id()) ::
          %Db.PlayerRecording{}
  @doc """
  Cast a player recording to a db player outcome
  """
  def player_recording_to_db_player_recording(
        %PlayerRecording{
          player_id: player_uuid,
          recording: recording,
          backing_track_id: backing_track_id
        },
        event_type,
        event_id
      )
      when event_type in [:round, :game] do
    # minify recording json in preparation for db insert
    %Db.PlayerRecording{
      player_uuid: player_uuid,
      recording: minify_recording_json(recording),
      backing_track_uuid: backing_track_id,
      event_type: event_type,
      event_id: event_id
    }
  end

  @spec minify_recording_json(%Loop{}) :: map()
  @doc """
  Minify the aussie toy mini
  """
  def minify_recording_json(%Loop{timestep_slices: ts_slices, timestep_size: ts_size}) do
    %{
      ts_size: ts_size,
      ts_slices:
        Enum.map(ts_slices, fn %TimestepSlice{timestep: ts, notes: ns} ->
          %{
            ts: ts,
            ns:
              Enum.map(ns, fn %Note{key: k, velocity: v, duration: d} ->
                %{k: k, v: v, d: d}
              end)
          }
        end)
    }
  end

  @spec unminify_recording_json(map()) :: %Loop{}
  @doc """
  Unminify recording json
  """
  def unminify_recording_json(%{ts_slices: timestep_slices, ts_size: timestep_size}) do
    %Loop{
      timestep_size: timestep_size,
      timestep_slices:
        Enum.map(timestep_slices, fn %{ts: timestep, ns: notes} ->
          %TimestepSlice{
            timestep: timestep,
            notes:
              Enum.map(notes, fn %{k: key, v: velocity, d: duration} ->
                %Note{key: key, velocity: velocity, duration: duration}
              end)
          }
        end)
    }
  end
end
