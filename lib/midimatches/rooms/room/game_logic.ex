defmodule Midimatches.Rooms.Room.GameLogic do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """

  alias Midimatches.{
    Rooms.Room.Game.Views,
    Rooms.Room.GameServer,
    S3ClientProxy,
    Types.GameRules,
    Types.Player,
    Utils
  }

  require Logger

  @type id() :: String.t()
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }

  @spec start_game(%GameRules{}, MapSet.t(Player), id(), id()) :: %GameServer{}
  def start_game(game_rules, players, room_id, game_id) do
    player_ids_list =
      players
      |> MapSet.to_list()
      |> Enum.map(& &1.player_id)

    sample_beats = S3ClientProxy.random_sample_beats(game_rules.rounds_to_win)

    %GameServer{
      room_id: room_id,
      game_id: game_id,
      game_rules: game_rules,
      players: players,
      player_ids_set: MapSet.new(player_ids_list),
      game_view: :game_start,
      contestants: player_ids_list,
      sample_beats: sample_beats,
      scores: player_ids_list |> Enum.map(&{&1, 0}) |> Map.new(),
      view_deadline: Utils.calc_future_timestamp(game_rules.view_timeouts.game_start)
    }
  end

  @spec add_player(%GameServer{}, %Player{}) :: instruction_map()
  def add_player(%GameServer{players: players} = state, %Player{player_id: player_id} = player) do
    updated_players = MapSet.put(players, player)
    updated_contestants = [player_id | state.contestants] |> MapSet.new() |> MapSet.to_list()

    %GameServer{
      state
      | player_ids_set: MapSet.put(state.player_ids_set, player_id),
        players: updated_players,
        contestants: updated_contestants,
        ready_ups: MapSet.put(state.ready_ups, player_id),
        scores: Map.put(state.scores, player_id, 0)
    }
    |> as_instruction(sync?: true, view_change?: false)
  end

  @spec remove_player(%GameServer{}, id()) :: instruction_map()
  def remove_player(%GameServer{} = state, player_id) do
    valid_player_to_drop? = MapSet.member?(state.player_ids_set, player_id)

    if valid_player_to_drop? do
      updated_players =
        state.players
        |> MapSet.to_list()
        |> Enum.reject(&(&1.player_id == player_id))
        |> MapSet.new()

      # filter out vote cast by the leaving player's. Votes for the leaving player will be treated
      # as equal to abstaining.
      updated_votes =
        state.votes
        |> Map.to_list()
        |> Enum.reject(fn {voter, _candidate} -> voter == player_id end)
        |> Map.new()

      %GameServer{
        state
        | player_ids_set: MapSet.delete(state.player_ids_set, player_id),
          players: updated_players,
          contestants: Enum.reject(state.contestants, &(&1 == player_id)),
          ready_ups: MapSet.delete(state.ready_ups, player_id),
          votes: updated_votes,
          scores: Map.delete(state.scores, player_id)
      }
    else
      state
    end
    |> as_instruction(sync?: valid_player_to_drop?, view_change?: false)
  end

  @spec ready_up(%GameServer{}, id()) :: instruction_map()
  defdelegate ready_up(state, player_id), to: Views.GameStart, as: :ready_up

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
