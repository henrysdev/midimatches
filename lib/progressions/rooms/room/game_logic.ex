defmodule Progressions.Rooms.Room.GameLogic do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """

  alias Progressions.{
    Rooms.Room.Game.Views,
    Rooms.Room.GameServer,
    Types.GameRules,
    Types.Player
  }

  require Logger

  @type id() :: String.t()
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  @spec start_game(%GameRules{}, MapSet.t(Player), id()) :: %GameServer{}
  def start_game(game_rules, players, room_id) do
    musicians_list =
      players
      |> MapSet.to_list()
      |> Enum.map(& &1.musician_id)

    %GameServer{
      room_id: room_id,
      game_rules: game_rules,
      players: players,
      musicians: MapSet.new(musicians_list),
      game_view: :game_start,
      contestants: musicians_list,
      scores: musicians_list |> Enum.map(&{&1, 0}) |> Map.new()
    }
  end

  @spec remove_musician(%GameServer{}, id()) :: instruction_map()
  def remove_musician(%GameServer{} = state, musician_id) do
    updated_players =
      state.players
      |> MapSet.to_list()
      |> Enum.reject(&(&1.musician_id == musician_id))
      |> MapSet.new()

    # filter out votes for player who left
    updated_votes =
      state.votes
      |> Map.to_list()
      |> Enum.reject(fn {_k, v} -> v == musician_id end)
      |> Map.new()

    %GameServer{
      state
      | musicians: MapSet.delete(state.musicians, musician_id),
        players: updated_players,
        contestants: Enum.reject(state.contestants, &(&1 == musician_id)),
        ready_ups: MapSet.delete(state.ready_ups, musician_id),
        recordings: Map.delete(state.recordings, musician_id),
        votes: updated_votes,
        scores: Map.delete(state.scores, musician_id)
    }
    |> as_instruction(sync?: true, view_change?: false)
  end

  @spec ready_up(%GameServer{}, id()) :: instruction_map()
  defdelegate ready_up(state, musician_id), to: Views.GameStart, as: :ready_up

  @spec add_recording(%GameServer{}, any) :: instruction_map()
  defdelegate add_recording(state, recording), to: Views.Recording, as: :add_recording

  @spec cast_vote(%GameServer{}, {id(), id()}) :: instruction_map()
  defdelegate cast_vote(state, vote), to: Views.PlaybackVoting, as: :cast_vote

  @spec advance_game_view(%GameServer{}) :: instruction_map()
  @doc """
  Execute default behavior for ending current game view and advance to next game view
  """
  def advance_game_view(%GameServer{game_view: game_view} = state) do
    case game_view do
      :game_start ->
        Views.GameStart.advance_view(state)

      :round_start ->
        Views.RoundStart.advance_view(state)

      :recording ->
        Views.Recording.advance_view(state)

      :playback_voting ->
        Views.PlaybackVoting.advance_view(state)

      :round_end ->
        Views.RoundEnd.advance_view(state)

      :game_end ->
        Views.GameEnd.advance_view(state)

      _ ->
        Logger.warn("unrecognized game_view encountered: #{game_view}")
        state
    end
    |> as_instruction(sync?: true, view_change?: true)
  end

  def as_instruction(%GameServer{} = state, sync?: sync?, view_change?: view_change?),
    do: %{sync_clients?: sync?, view_change?: view_change?, state: state}
end
