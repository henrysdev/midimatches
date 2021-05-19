defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.GameEnd do
  @moduledoc """
  Game logic specific to the game_end game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.FreeForAllLogic,
    Rooms.Room.Modes.FreeForAll.Views.RoundEnd,
    Types.GameRecord,
    Types.PlayerOutcome,
    Types.WinResult
  }

  @type game_end_reason :: :completed | :canceled

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(%GameInstance{game_view: :game_end} = state) do
    FreeForAllLogic.end_game(state, :completed)
    state
  end

  @spec build_game_record(%GameInstance{}, game_end_reason()) :: %GameRecord{}
  def build_game_record(
        %GameInstance{
          game_winners: game_winners,
          player_ids_set: player_ids_set,
          round_records: round_records,
          scores: scores
        },
        game_end_reason
      ) do
    game_outcomes = build_game_outcomes(game_winners, player_ids_set, scores)

    %GameRecord{
      game_outcomes: game_outcomes,
      round_records: round_records,
      game_end_reason: game_end_reason
    }
  end

  @spec build_game_outcomes(%WinResult{}, any(), any()) :: list(PlayerOutcome)
  defp build_game_outcomes(game_winners, player_ids_set, scores) do
    game_winners =
      if is_nil(game_winners) do
        RoundEnd.scores_to_win_result(scores)
      else
        game_winners
      end

    winning_player_ids_set = MapSet.new(game_winners.winners)

    winner_outcome =
      if MapSet.size(winning_player_ids_set) > 1 do
        :tied
      else
        :won
      end

    player_ids_set
    |> Enum.to_list()
    |> Enum.map(fn player_id ->
      num_points = Map.get(scores, player_id, 0)

      if MapSet.member?(winning_player_ids_set, player_id) do
        %PlayerOutcome{
          player_id: player_id,
          event_type: :game,
          outcome: winner_outcome,
          num_points: num_points
        }
      else
        %PlayerOutcome{
          player_id: player_id,
          event_type: :game,
          outcome: :lost,
          num_points: num_points
        }
      end
    end)
  end
end
