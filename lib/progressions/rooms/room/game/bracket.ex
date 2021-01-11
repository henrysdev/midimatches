defmodule Progressions.Rooms.Room.Game.Bracket do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """
  alias __MODULE__

  use TypedStruct

  @type id() :: String.t()
  @type pairings() :: list(list(id))

  typedstruct do
    field(:match_ups, %{required(id()) => list(id)}, default: %{})
    field(:winners, %MapSet{}, default: MapSet.new())
    field(:wins_to_advance, integer())
    field(:final_winner, id())
  end

  @spec new_bracket(list(id)) :: %Bracket{}
  @doc """
  Generates a new bracket struct from the given list of musician ids. Note that
  the size of the musician ids list must be a power of 2 for a bracket to function
  properly.
  """
  def new_bracket([final_winner] = musicians) when length(musicians) == 1 do
    %Bracket{final_winner: final_winner}
  end

  def new_bracket(musicians) do
    pairings =
      musicians
      |> Enum.shuffle()
      |> Enum.chunk_every(2)
      |> Enum.map(fn [m1, m2] -> [min(m1, m2), max(m1, m2)] end)

    match_ups =
      Enum.reduce(pairings, %{}, fn [m1, m2] = pair, acc ->
        acc
        |> Map.put(m1, pair)
        |> Map.put(m2, pair)
      end)

    %Bracket{match_ups: match_ups, wins_to_advance: length(pairings)}
  end

  @spec record_winner(%Bracket{}, id()) :: %Bracket{}
  @doc """
  Record the outcome of a matchup in the bracket. Upon all match ups being
  recorded, the bracket will advance to the next round of match ups until a
  final winner is determined.
  """
  def record_winner(
        %Bracket{match_ups: match_ups, winners: winners, wins_to_advance: wins_to_advance} =
          bracket,
        winner
      ) do
    case {Map.has_key?(match_ups, winner), MapSet.size(winners)} do
      # record a win (not the last win)
      {true, mapset_size} when mapset_size < wins_to_advance - 1 ->
        [m1, m2] = Map.get(match_ups, winner)

        %Bracket{
          bracket
          | winners: MapSet.put(winners, winner),
            match_ups:
              match_ups
              |> Map.delete(m1)
              |> Map.delete(m2)
        }

      # record ultimate win of round and advance to next bracket
      {true, mapset_size} when mapset_size == wins_to_advance - 1 ->
        advancing_musicians =
          winners
          |> MapSet.put(winner)
          |> MapSet.to_list()

        new_bracket(advancing_musicians)

      _ ->
        bracket
    end
  end

  @spec remaining_matches(%Bracket{}) :: pairings()
  @doc """
  Returns a list of matches that have not yet had an outcome recorded.
  """
  def remaining_matches(%Bracket{match_ups: match_ups}) do
    match_ups
    |> Map.values()
    |> Enum.uniq()
  end
end
