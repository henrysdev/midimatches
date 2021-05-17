defmodule MidimatchesDb.PlayerOutcomes do
  @moduledoc """
  DB boundary for PlayerOutcome objects
  """

  alias MidimatchesDb.{
    GameRecord,
    PlayerOutcome,
    RoundRecord,
    Repo
  }

  @spec create_player_outcome(%PlayerOutcome{}) :: %PlayerOutcome{}
  @doc """
  Insert a new player outcome
  """
  def create_player_outcome(%PlayerOutcome{} = player_outcome) do
    Repo.insert!(player_outcome)
  end

  @spec add_player_outcome_for_game(%PlayerOutcome{}, %GameRecord{}) :: %PlayerOutcome{}
  @doc """
  Associate and insert a new player outcome for a game
  """
  def add_player_outcome_for_game(
        %PlayerOutcome{} = player_outcome,
        %GameRecord{id: game_id}
      ) do
    %PlayerOutcome{
      player_outcome
      | event_id: game_id,
        event_type: :game
    }
    |> create_player_outcome()
  end

  @spec add_player_outcome_for_round(%PlayerOutcome{}, %RoundRecord{}) :: %PlayerOutcome{}
  @doc """
  Associate and insert a new player outcome for a round
  """
  def add_player_outcome_for_round(
        %PlayerOutcome{} = player_outcome,
        %RoundRecord{id: round_id}
      ) do
    %PlayerOutcome{
      player_outcome
      | event_id: round_id,
        event_type: :round
    }
    |> create_player_outcome()
  end
end
