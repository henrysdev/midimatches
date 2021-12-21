defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.PlaybackVoting do
  @moduledoc """
  Game logic specific to the playback_voting game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.FreeForAllLogic,
    Types.GameRules,
    Types.GameRules.ViewTimeouts,
    Types.WinResult,
    Utils
  }

  @type id() :: String.t()
  @type vote_status() :: :bad_vote | :valid_vote | :last_valid_vote
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameInstance{}
        }
  @type votes_map() :: %{required(id) => id}
  @type ballot() :: {id(), id()}

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  @doc """
  Take care of any unfinished business before advancing view.
  """
  def advance_view(
        %GameInstance{
          game_view: :playback_voting,
          game_rules:
            %GameRules{
              view_timeouts: view_timeouts
            } = game_rules,
          sample_beats: sample_beats,
          round_winners: round_winners,
          round_num: round_num
        } = state
      ) do
    # address case where last vote has not yet been encountered and therefore round winner has not
    # yet been calculated
    state =
      if is_nil(round_winners) do
        update_scores(state)
      else
        state
      end

    # calculate round end time to accommodate playing back the winning track
    current_sample_beat = Enum.at(sample_beats, round_num - 1)
    sample_time = Utils.calc_sample_time(current_sample_beat.bpm)

    state = %GameInstance{
      state
      | game_rules: %GameRules{
          game_rules
          | view_timeouts: %ViewTimeouts{
              view_timeouts
              | round_end: sample_time
            }
        }
    }

    %GameInstance{state | game_view: :round_end}
  end

  @spec cast_vote(%GameInstance{}, ballot()) :: instruction_map()
  @doc """
  Handle player event where a judge casts a vote.
  """
  def cast_vote(%GameInstance{} = state, ballot) do
    case vote_status(state, ballot) do
      # last vote - advance to next game view
      :last_valid_vote ->
        state
        |> valid_vote(ballot)
        |> last_vote()
        |> advance_view()
        |> FreeForAllLogic.as_instruction(sync?: true, view_change?: true)

      # valid vote - count and continue
      :valid_vote ->
        state
        |> valid_vote(ballot)
        |> FreeForAllLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _bad_vote ->
        FreeForAllLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec vote_status(%GameInstance{}, ballot()) :: vote_status()
  defp vote_status(
         %GameInstance{
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

  @spec valid_vote(%GameInstance{}, ballot()) :: %GameInstance{}
  defp valid_vote(%GameInstance{votes: votes} = state, {player_id, vote}) do
    %GameInstance{state | votes: Map.put(votes, player_id, vote)}
  end

  @spec last_vote(%GameInstance{}) :: %GameInstance{}
  defp last_vote(%GameInstance{} = state), do: update_scores(state)

  @spec update_scores(%GameInstance{}) :: %GameInstance{}
  def update_scores(
        %GameInstance{votes: votes, scores: scores, player_ids_set: player_ids_set} = state
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

    %GameInstance{state | scores: scores, round_winners: round_winners}
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

  # @spec auto_votes(%GameInstance{}) :: %GameInstance{}
  # defp auto_votes(
  #        %GameInstance{
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

  # @spec simulate_vote(%GameInstance{}, ballot()) :: %GameInstance{}
  # defp simulate_vote(%GameInstance{} = state, ballot) do
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
