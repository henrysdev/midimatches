defmodule Progressions.Rooms.Room.Game.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Progressions.Rooms.Room.GameServer

  @type id() :: String.t()

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(
        %GameServer{
          game_view: :round_end,
          round_num: round_num,
          game_rules: %{rounds_to_win: rounds_to_win},
          scores: scores
        } = state
      ) do
    if round_num < rounds_to_win do
      reset_round(state)
    else
      %GameServer{state | game_view: :game_end, winner: get_winner(scores)}
    end
  end

  @spec reset_round(%GameServer{}) :: %GameServer{}
  def reset_round(%GameServer{
        room_id: room_id,
        game_rules: game_rules,
        players: players,
        musicians: musicians,
        contestants: contestants,
        view_counter: view_counter,
        round_num: round_num
      }) do
    %GameServer{
      game_view: :round_start,
      room_id: room_id,
      game_rules: game_rules,
      players: players,
      musicians: musicians,
      view_counter: view_counter,
      contestants: contestants,
      round_num: round_num + 1
    }
  end

  @spec get_winner(%{required(id()) => integer()}) :: id()
  defp get_winner(scores) do
    Enum.max_by(scores, fn {_id, num_points} -> num_points end)
  end
end
