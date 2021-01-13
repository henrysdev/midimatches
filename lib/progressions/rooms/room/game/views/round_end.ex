defmodule Progressions.Rooms.Room.Game.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Progressions.Rooms.Room.{
    Game.Bracket,
    GameServer
  }

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(%GameServer{bracket: bracket, game_view: :round_end} = state) do
    if is_nil(bracket.final_winner) do
      reset_round(state)
    else
      %GameServer{state | game_view: :game_end}
    end
  end

  @spec reset_round(%GameServer{}) :: %GameServer{}
  def reset_round(%GameServer{
        room_id: room_id,
        game_rules: game_rules,
        musicians: musicians,
        bracket: bracket,
        view_counter: view_counter
      }) do
    [contestants | _rest] = Bracket.remaining_matches(bracket)

    judges =
      musicians
      |> MapSet.to_list()
      |> Enum.reject(&Enum.member?(contestants, &1))

    %GameServer{
      game_view: :round_start,
      room_id: room_id,
      game_rules: game_rules,
      musicians: musicians,
      bracket: bracket,
      view_counter: view_counter,
      contestants: contestants,
      judges: judges
    }
  end
end
