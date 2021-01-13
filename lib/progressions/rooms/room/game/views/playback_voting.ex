defmodule Progressions.Rooms.Room.Game.Views.PlaybackVoting do
  @moduledoc """
  Game logic specific to the playback_voting game view
  """

  alias Progressions.Rooms.Room.{
    Game.Bracket,
    GameLogic,
    GameServer
  }

  @type id() :: String.t()
  @type vote_status() :: :bad_vote | :valid_vote | :last_valid_vote
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }
  @type ballot() :: {id(), id()}

  @spec advance_view(%GameServer{}) :: %GameServer{}
  @doc """
  Take care of any unfinished business before advancing view. Cast random
  ballots on behalf of any/all judges who have not cast a ballot at time of calling.
  """
  def advance_view(
        %GameServer{
          game_view: :playback_voting,
          votes: votes,
          contestants: contestants,
          judges: judges
        } = state
      ) do
    missing_voters =
      judges
      |> Stream.reject(&(votes |> Map.keys() |> Enum.member?(&1)))

    state =
      Enum.reduce(missing_voters, state, fn voter_id, acc_state ->
        contestant_id = Enum.random(contestants)
        ballot = {voter_id, contestant_id}
        simulate_vote(acc_state, ballot)
      end)

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

  @spec simulate_vote(%GameServer{}, ballot()) :: %GameServer{}
  defp simulate_vote(%GameServer{} = state, ballot) do
    case vote_status(state, ballot) do
      # last vote - advance to next game view
      :last_valid_vote ->
        state
        |> valid_vote(ballot)
        |> last_vote()

      # valid vote - count and continue
      :valid_vote ->
        valid_vote(state, ballot)

      # invalid vote - return state unchanged
      _bad_vote ->
        state
    end
  end

  @spec vote_status(%GameServer{}, ballot()) :: vote_status()
  defp vote_status(
         %GameServer{judges: judges, contestants: contestants, votes: votes},
         {musician_id, vote}
       ) do
    valid_vote? =
      Enum.member?(judges, musician_id) and
        Enum.member?(contestants, vote) and
        !Map.has_key?(votes, musician_id)

    last_vote? = length(judges) - map_size(votes) == 1

    case {valid_vote?, last_vote?} do
      {true, true} -> :last_valid_vote
      {true, false} -> :valid_vote
      _ -> :bad_vote
    end
  end

  @spec valid_vote(%GameServer{}, ballot()) :: %GameServer{}
  defp valid_vote(%GameServer{votes: votes} = state, {musician_id, vote}) do
    %GameServer{state | votes: Map.put(votes, musician_id, vote)}
  end

  @spec last_vote(%GameServer{}) :: %GameServer{}
  defp last_vote(%GameServer{bracket: bracket, votes: votes} = state) do
    {winner_id, _freq} =
      winner =
      votes
      |> Map.values()
      |> Enum.frequencies()
      |> Enum.max()

    bracket = Bracket.record_winner(bracket, winner_id)

    %GameServer{
      state
      | votes: votes,
        winner: winner,
        bracket: bracket
    }
  end
end
