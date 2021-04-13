defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.PlaybackVoting do
  @moduledoc """
  Game logic specific to the playback_voting game view
  """

  alias Midimatches.{
    Rooms.Room.GameLogic,
    Rooms.Room.GameServer,
    Types.WinResult,
    Utils
  }

  @type id() :: String.t()
  @type vote_status() :: :bad_vote | :valid_vote | :last_valid_vote
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }
  @type votes_map() :: %{required(id) => id}
  @type ballot() :: {id(), id()}

  @spec advance_view(%GameServer{}) :: %GameServer{}
  @doc """
  Take care of any unfinished business before advancing view.
  """
  def advance_view(%GameServer{game_view: :playback_voting, round_winners: round_winners} = state) do
    # address case where last vote has not yet been encountered and therefore round winner has not
    # yet been calculated
    state =
      if is_nil(round_winners) do
        update_scores(state)
      else
        state
      end

    %GameServer{state | game_view: :round_end}
  end

  @spec cast_vote(%GameServer{}, ballot()) :: instruction_map()
  @doc """
  Handle player event where a judge casts a vote.
  """
  def cast_vote(%GameServer{} = state, ballot) do
    case vote_status(state, ballot) do
      # last vote - advance to next game view
      :last_valid_vote ->
        state
        |> valid_vote(ballot)
        |> last_vote()
        |> advance_view()
        |> GameLogic.as_instruction(sync?: true, view_change?: true)

      # valid vote - count and continue
      :valid_vote ->
        state
        |> valid_vote(ballot)
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _bad_vote ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec vote_status(%GameServer{}, ballot()) :: vote_status()
  defp vote_status(
         %GameServer{
           player_ids_set: player_ids_set,
           audience_member_ids_set: audience_member_ids_set,
           contestants: contestants,
           votes: votes
         },
         {player_id, vote}
       ) do
    judges = MapSet.union(player_ids_set, audience_member_ids_set) |> MapSet.to_list()

    valid_vote? =
      Enum.member?(judges, player_id) and
        Enum.member?(contestants, vote) and
        !Map.has_key?(votes, player_id)

    last_vote? = length(judges) - map_size(votes) == 1

    case {valid_vote?, last_vote?} do
      {true, true} -> :last_valid_vote
      {true, false} -> :valid_vote
      _ -> :bad_vote
    end
  end

  @spec valid_vote(%GameServer{}, ballot()) :: %GameServer{}
  defp valid_vote(%GameServer{votes: votes} = state, {player_id, vote}) do
    %GameServer{state | votes: Map.put(votes, player_id, vote)}
  end

  @spec last_vote(%GameServer{}) :: %GameServer{}
  defp last_vote(%GameServer{} = state), do: update_scores(state)

  @spec update_scores(%GameServer{}) :: %GameServer{}
  def update_scores(
        %GameServer{votes: votes, scores: scores, player_ids_set: player_ids_set} = state
      ) do
    scores =
      Enum.reduce(
        votes,
        scores,
        fn {_voter, candidate_id}, acc ->
          Map.update(acc, candidate_id, 1, &(&1 + 1))
        end
      )

    round_winners =
      votes
      |> votes_to_win_result(player_ids_set)

    %GameServer{state | scores: scores, round_winners: round_winners}
  end

  @spec votes_to_win_result(votes_map(), MapSet.t(id)) :: %WinResult{}
  @doc """
  Transform a votes map into win result struct. Filters out votes for players that are no
  longer in the game.
  """
  def votes_to_win_result(votes, current_players_set) do
    vote_freq_list =
      votes
      |> Map.values()
      |> Enum.filter(&MapSet.member?(current_players_set, &1))
      |> Enum.frequencies()
      |> Map.to_list()

    voted_for_players_set =
      vote_freq_list
      |> Enum.map(fn {id, _freq} -> id end)
      |> MapSet.new()

    zero_vote_freq_tuples =
      current_players_set
      |> MapSet.difference(voted_for_players_set)
      |> MapSet.to_list()
      |> Enum.map(fn id -> {id, 0} end)

    Utils.build_win_result(vote_freq_list ++ zero_vote_freq_tuples)
  end

  # Auto voting and random voting logic (save logic for bot usage)
  # - to be called from advance_view()

  # @spec auto_votes(%GameServer{}) :: %GameServer{}
  # defp auto_votes(
  #        %GameServer{
  #          game_view: :playback_voting,
  #          votes: votes,
  #          contestants: contestants,
  #          player_ids_set: player_ids_set
  #        } = state
  #      ) do
  #   judges = player_ids_set |> MapSet.to_list()

  #   missing_voters =
  #     judges
  #     |> Enum.reject(&(votes |> Map.keys() |> Enum.member?(&1)))

  #   Enum.reduce(missing_voters, state, fn voter_id, acc_state ->
  #     contestant_id =
  #       contestants
  #       |> Stream.reject(&(&1 == voter_id))
  #       |> Enum.random()

  #     ballot = {voter_id, contestant_id}
  #     simulate_vote(acc_state, ballot)
  #   end)
  # end

  # @spec simulate_vote(%GameServer{}, ballot()) :: %GameServer{}
  # defp simulate_vote(%GameServer{} = state, ballot) do
  #   case vote_status(state, ballot) do
  #     :last_valid_vote ->
  #       state
  #       |> valid_vote(ballot)
  #       |> last_vote()

  #     :valid_vote ->
  #       valid_vote(state, ballot)

  #     _bad_vote ->
  #       state
  #   end
  # end
end
