defmodule Progressions.Rooms.Room.Game.Views.GameStart do
  @moduledoc """
  Game logic specific to the game_start game view
  """
  alias Progressions.Rooms.Room.{
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
  def advance_view(%GameServer{game_view: :game_start} = state) do
    %GameServer{state | game_view: :round_start}
  end

  @spec ready_up(%GameServer{}, id()) :: instruction_map()
  @doc """
  Handle ready-up player events.
  """
  def ready_up(%GameServer{musicians: musicians, ready_ups: ready_ups} = state, musician_id) do
    valid_ready_up? =
      MapSet.member?(musicians, musician_id) and !MapSet.member?(ready_ups, musician_id)

    last_ready_up? = MapSet.size(musicians) - MapSet.size(ready_ups) == 1

    case {valid_ready_up?, last_ready_up?} do
      # last needed ready up - reset ready ups and transition to next game server state
      {true, true} ->
        %GameServer{
          state
          | ready_ups: MapSet.put(ready_ups, musician_id),
            round_recording_start_time: :os.system_time(:microsecond)
        }
        |> advance_view()
        |> GameLogic.as_instruction(sync?: true, view_change?: true)

      # valid ready up - store ready up in game server state
      {true, false} ->
        %GameServer{state | ready_ups: MapSet.put(ready_ups, musician_id)}
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _ ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end
end
