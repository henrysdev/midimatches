defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Progressions.{
    Rooms.Room.GameServer,
    Types.ClientGameState,
    Types.WinResult
  }

  @type id() :: String.t()
  @type votes_map() :: %{required(id) => id}
  @type scores_map() :: %{required(id) => number}

  @spec votes_to_win_result(votes_map()) :: %WinResult{}
  @doc """
  Transform a votes map into win result struct
  """
  def votes_to_win_result(%{} = votes) do
    votes
    |> Map.values()
    |> Enum.frequencies()
    |> build_win_result()
  end

  @spec scores_to_win_result(scores_map()) :: %WinResult{}
  @doc """
  Transform a scores map into win result struct
  """
  def scores_to_win_result(%{} = scores) do
    scores
    |> Map.to_list()
    |> build_win_result()
  end

  defp build_win_result(freq_list) do
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
  def gen_uuid(), do: UUID.uuid4()

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

    %ClientGameState{
      # static fields
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,

      # dynamic fields
      game_view: server_state.game_view,
      players: players_list,
      num_votes_cast: num_votes_cast,
      ready_ups: ready_ups_list,
      recordings: server_state.recordings,
      round_recording_start_time: server_state.round_recording_start_time,
      game_winners: server_state.game_winners,
      contestants: server_state.contestants,
      scores: server_state.scores,
      round_num: server_state.round_num,
      round_winners: server_state.round_winners
    }
  end
end
