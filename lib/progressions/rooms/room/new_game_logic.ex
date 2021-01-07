defmodule Progressions.Rooms.Room.NewGameLogic do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """

  alias Progressions.{
    Rooms.Room.Game.Bracket,
    Rooms.Room.NewGameServer,
    Types.GameRules
  }

  @type id() :: String.t()

  # TODO use dedicated config type
  @spec start_game(%GameRules{}, list(id)) :: %NewGameServer{}
  def start_game(game_rules, musicians) do
    %NewGameServer{
      game_rules: game_rules,
      musicians: MapSet.new(musicians),
      bracket: Bracket.new_bracket(musicians),
      game_view: :game_start
    }
  end

  @spec ready_up(%NewGameServer{}, id()) :: %NewGameServer{}
  def ready_up(%NewGameServer{musicians: musicians, ready_ups: ready_ups} = state, musician_id) do
    valid_ready_up? =
      MapSet.member?(musicians, musician_id) and !MapSet.member?(ready_ups, musician_id)

    last_ready_up? = MapSet.size(musicians) - MapSet.size(ready_ups) == 1

    case {valid_ready_up?, last_ready_up?} do
      # last needed ready up - reset ready ups and transition to next game server state
      {true, true} ->
        %NewGameServer{
          state
          | ready_ups: MapSet.put(ready_ups, musician_id),
            round_recording_start_time: :os.system_time(:microsecond),
            game_view: :recording
        }

      # valid ready up - store ready up in game server state
      {true, false} ->
        %NewGameServer{state | ready_ups: MapSet.put(ready_ups, musician_id)}

      # invalid ready up - return game server state unchanged
      _ ->
        state
    end
  end

  @spec add_recording(%NewGameServer{}, any) :: %NewGameServer{}
  def add_recording(%NewGameServer{} = state, {_musician_id, _recording}) do
    # TODO implement
    state
  end

  @spec cast_vote(%NewGameServer{}, {id(), id()}) :: %NewGameServer{}
  def cast_vote(%NewGameServer{} = state, _vote) do
    # TODO implement
    state
  end
end
