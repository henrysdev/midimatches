defmodule Midimatches.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Midimatches.{
    Rooms.Room.GameServer,
    Rooms.RoomServer,
    Types.ClientGameState,
    Types.ClientRoomState,
    Types.WinResult
  }

  @type id() :: String.t()
  @type freq_pair() :: {id(), number()}

  @spec build_win_result(list(freq_pair)) :: %WinResult{}
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

  @spec server_to_client_game_state(%GameServer{}) :: any
  @doc """
  Transform game server state into update payload for clients
  """
  def server_to_client_game_state(%GameServer{} = server_state) do
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
      round_winners: server_state.round_winners
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
      num_curr_players: MapSet.size(server_state.players),
      in_game: !is_nil(server_state.game)
    }
  end
end