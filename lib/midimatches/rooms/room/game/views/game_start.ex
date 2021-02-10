defmodule Midimatches.Rooms.Room.Game.Views.GameStart do
  @moduledoc """
  Game logic specific to the game_start game view
  """
  alias Midimatches.Rooms.Room.{
    GameLogic,
    GameServer
  }

  @type id() :: String.t()
  @type ready_up_status() :: :bad_ready_up | :valid_ready_up | :last_valid_ready_up
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(
        %GameServer{musicians: musicians, ready_ups: ready_ups, game_view: :game_start} = state
      ) do
    missing_ready_ups =
      musicians
      |> MapSet.difference(ready_ups)
      |> MapSet.to_list()

    state =
      Enum.reduce(missing_ready_ups, state, fn ready_up_musician_id, acc_state ->
        simulate_ready_up(acc_state, ready_up_musician_id)
      end)

    %GameServer{state | game_view: :round_start}
  end

  @spec ready_up(%GameServer{}, id()) :: instruction_map()
  @doc """
  Handle ready-up player events.
  """
  def ready_up(%GameServer{} = state, musician_id) do
    case ready_up_status(state, musician_id) do
      # last needed ready up - reset ready ups and transition to next game server state
      :last_valid_ready_up ->
        state
        |> valid_ready_up(musician_id)
        |> advance_view()
        |> GameLogic.as_instruction(sync?: true, view_change?: true)

      # valid ready up - store ready up in game server state
      :valid_ready_up ->
        state
        |> valid_ready_up(musician_id)
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _bad_ready_up ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec simulate_ready_up(%GameServer{}, id()) :: %GameServer{}
  def simulate_ready_up(%GameServer{} = state, musician_id) do
    case ready_up_status(state, musician_id) do
      :last_valid_ready_up ->
        state
        |> valid_ready_up(musician_id)

      :valid_ready_up ->
        state
        |> valid_ready_up(musician_id)

      _bad_ready_up ->
        state
    end
  end

  @spec ready_up_status(%GameServer{}, id()) :: ready_up_status()
  defp ready_up_status(
         %GameServer{musicians: musicians, ready_ups: ready_ups},
         musician_id
       ) do
    valid_ready_up? =
      MapSet.member?(musicians, musician_id) and !MapSet.member?(ready_ups, musician_id)

    last_ready_up? = MapSet.size(musicians) - MapSet.size(ready_ups) == 1

    case {valid_ready_up?, last_ready_up?} do
      {true, true} -> :last_valid_ready_up
      {true, false} -> :valid_ready_up
      _ -> :bad_ready_up
    end
  end

  defp valid_ready_up(%GameServer{ready_ups: ready_ups} = state, musician_id) do
    %GameServer{state | ready_ups: MapSet.put(ready_ups, musician_id)}
  end
end
