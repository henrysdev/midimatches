defmodule Midimatches.Rooms.Room.Game.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Midimatches.{
    Rooms.Room.GameServer,
    Types.WinResult,
    Utils
  }

  @type id() :: String.t()
  @type scores_map() :: %{required(id) => number}

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(
        %GameServer{
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

  @spec reset_round(%GameServer{}) :: %GameServer{}
  def reset_round(%GameServer{
        room_id: room_id,
        game_id: game_id,
        game_rules: game_rules,
        players: players,
        musicians: musicians,
        contestants: contestants,
        view_counter: view_counter,
        scores: scores,
        round_num: round_num
      }) do
    %GameServer{
      game_view: :round_start,
      room_id: room_id,
      game_id: game_id,
      game_rules: game_rules,
      players: players,
      musicians: musicians,
      view_counter: view_counter,
      contestants: contestants,
      scores: scores,
      round_num: round_num + 1
    }
  end

  @spec game_over(%GameServer{}) :: %GameServer{}
  def game_over(%GameServer{scores: scores} = state) do
    game_winners = scores_to_win_result(scores)
    %GameServer{state | game_view: :game_end, game_winners: game_winners}
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
