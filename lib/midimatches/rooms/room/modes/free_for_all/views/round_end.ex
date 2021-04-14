defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Types.WinResult,
    Utils
  }

  @type id() :: String.t()
  @type scores_map() :: %{required(id) => number}

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(
        %GameInstance{
          game_view: :round_end,
          round_num: round_num,
          game_rules: %{rounds_to_win: rounds_to_win}
        } = state
      ) do
    if round_num < rounds_to_win do
      reset_round(state)
    else
      game_over(state)
    end
  end

  @spec reset_round(%GameInstance{}) :: %GameInstance{}
  def reset_round(%GameInstance{
        room_id: room_id,
        game_id: game_id,
        game_rules: game_rules,
        players: players,
        player_ids_set: player_ids_set,
        contestants: contestants,
        view_counter: view_counter,
        scores: scores,
        sample_beats: sample_beats,
        round_num: round_num
      }) do
    %GameInstance{
      game_view: :round_start,
      room_id: room_id,
      game_id: game_id,
      game_rules: game_rules,
      players: players,
      player_ids_set: player_ids_set,
      view_counter: view_counter,
      contestants: contestants,
      scores: scores,
      sample_beats: sample_beats,
      round_num: round_num + 1
    }
  end

  @spec game_over(%GameInstance{}) :: %GameInstance{}
  def game_over(%GameInstance{scores: scores} = state) do
    game_winners = scores_to_win_result(scores)
    %GameInstance{state | game_view: :game_end, game_winners: game_winners}
  end

  @spec scores_to_win_result(scores_map()) :: %WinResult{}
  @doc """
  Transform a scores map into win result struct
  """
  def scores_to_win_result(%{} = scores) do
    scores
    |> Map.to_list()
    |> Utils.build_win_result()
  end
end
