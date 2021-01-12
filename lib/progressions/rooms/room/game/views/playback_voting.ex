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
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{game_view: :playback_voting} = state) do
    # TODO handle outstanding votes
    %GameServer{state | game_view: :round_end}
  end

  @spec cast_vote(%GameServer{}, {id(), id()}) :: instruction_map()
  @doc """
  Handle player event where a judge casts a vote.
  """
  def cast_vote(
        %GameServer{bracket: bracket, contestants: contestants, judges: judges, votes: votes} =
          state,
        {musician_id, vote}
      ) do
    valid_vote? =
      Enum.member?(judges, musician_id) and
        Enum.member?(contestants, vote) and
        !Map.has_key?(votes, musician_id)

    last_vote? = length(judges) - map_size(votes) == 1

    case {valid_vote?, last_vote?} do
      # last vote - advance to next game view
      {true, true} ->
        votes = Map.put(votes, musician_id, vote)

        winner =
          votes
          |> Map.values()
          |> Enum.frequencies()
          |> Enum.max()

        bracket = Bracket.record_winner(bracket, winner)

        %GameServer{
          state
          | votes: votes,
            winner: winner,
            bracket: bracket
        }
        |> GameLogic.advance_game_view()

      # valid vote - count and continue
      {true, false} ->
        %GameServer{state | votes: Map.put(votes, musician_id, vote)}
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _ ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end
end
