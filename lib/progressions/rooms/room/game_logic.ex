defmodule Progressions.Rooms.Room.GameLogic do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """

  alias Progressions.{
    Rooms.Room.Game.Bracket,
    Rooms.Room.GameServer,
    Types.GameRules
  }

  @type id() :: String.t()
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  @spec start_game(%GameRules{}, list(id), id()) :: %GameServer{}
  def start_game(game_rules, musicians, room_id) do
    bracket = Bracket.new_bracket(musicians)

    [contestants | judges] = Bracket.remaining_matches(bracket)
    judges = Enum.flat_map(judges, & &1)

    %GameServer{
      room_id: room_id,
      game_rules: game_rules,
      musicians: musicians,
      bracket: bracket,
      game_view: :game_start,
      contestants: contestants,
      judges: judges
    }
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
        |> advance_game_view()

      # valid ready up - store ready up in game server state
      {true, false} ->
        %GameServer{state | ready_ups: MapSet.put(ready_ups, musician_id)}
        |> as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _ ->
        as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec add_recording(%GameServer{}, any) :: instruction_map()
  @doc """
  Handle player event where a contestant submits a recording.
  """
  def add_recording(
        %GameServer{contestants: contestants, recordings: recordings} = state,
        {musician_id, recording}
      ) do
    valid_recording? =
      Enum.member?(contestants, musician_id) and
        !Map.has_key?(recordings, musician_id)

    last_recording? = length(contestants) - map_size(recordings) == 1

    case {valid_recording?, last_recording?} do
      # valid recording - store recording in game server state
      {true, false} ->
        %GameServer{state | recordings: Map.put(recordings, musician_id, recording)}
        |> as_instruction(sync?: true, view_change?: false)

      # last needed recording - store recording and transition to playback voting server state
      {true, true} ->
        %GameServer{state | recordings: Map.put(recordings, musician_id, recording)}
        |> advance_game_view()

      # invalid vote - return state unchanged
      _ ->
        as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec cast_vote(%GameServer{}, {id(), id()}) :: instruction_map()
  @doc """
  Handle player event where a judge casts a vote.
  """
  def cast_vote(
        %GameServer{bracket: bracket, contestants: contestants, judges: judges, votes: votes} =
          state,
        {musician_id, vote}
      ) do
    valid_vote? =
      Enum.member?(judges, musician_id) and
        Enum.member?(contestants, vote) and
        !Map.has_key?(votes, musician_id)

    last_vote? = length(judges) - map_size(votes) == 1

    case {valid_vote?, last_vote?} do
      # last vote - advance to next game view
      {true, true} ->
        votes = Map.put(votes, musician_id, vote)

        winner =
          votes
          |> Map.values()
          |> Enum.frequencies()
          |> Enum.max()

        bracket = Bracket.record_winner(bracket, winner)

        %GameServer{
          state
          | votes: votes,
            winner: winner,
            bracket: bracket
        }
        |> advance_game_view()

      # valid vote - count and continue
      {true, false} ->
        %GameServer{state | votes: Map.put(votes, musician_id, vote)}
        |> as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _ ->
        as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec advance_game_view(%GameServer{}) :: instruction_map()
  @doc """
  Execute default behavior for ending current game view and advance to next game view
  """
  def advance_game_view(%GameServer{game_view: game_view} = state) do
    # TODO implement default advance behaviors for each. A default behavior includes
    # - deciding what the next appropriate view is
    # - executing view-specific actions that are overdue (such as casting votes randomly, spawning an AI player, etc)
    # - switching the game server to the next appropriate view
    # - starting the timeout clock for the next view
    # - wrap as instruction to broadcast

    case game_view do
      :game_start ->
        %GameServer{state | game_view: :round_start}

      :round_start ->
        %GameServer{state | game_view: :recording}

      :recording ->
        %GameServer{state | game_view: :playback_voting}

      :playback_voting ->
        %GameServer{state | game_view: :round_end}

      :round_end ->
        # TODO if winner, change to game end
        %GameServer{state | game_view: :round_start}

      :game_end ->
        %GameServer{state | game_view: :game_start}

      _ ->
        state
    end
    |> as_instruction(sync?: true, view_change?: true)
  end

  defp as_instruction(%GameServer{} = state, sync?: sync?, view_change?: view_change?),
    do: %{sync_clients?: sync?, view_change?: view_change?, state: state}
end