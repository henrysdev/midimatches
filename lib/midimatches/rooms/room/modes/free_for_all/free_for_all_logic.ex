defmodule Midimatches.Rooms.Room.Modes.FreeForAll.FreeForAllLogic do
  @moduledoc """
  A collection of functions that allow facilitating a tournament-like bracket system.
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.Views,
    Types.GameRules,
    Types.Player,
    Utils
  }

  require Logger

  @type id() :: String.t()
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameInstance{}
        }

  @spec start_game(%GameRules{}, MapSet.t(Player), MapSet.t(Player), id(), id()) ::
          %GameInstance{}
  def start_game(game_rules, players, audience_members, room_id, game_id) do
    player_ids_list =
      players
      |> MapSet.to_list()
      |> Enum.map(& &1.player_id)

    audience_member_ids_list =
      audience_members
      |> MapSet.to_list()
      |> Enum.map(& &1.player_id)

    sample_beats =
      MidimatchesDb.BackingTracks.fetch_random_backing_tracks(game_rules.rounds_to_win)
      |> Enum.map(& &1.file_url)

    %GameInstance{
      room_id: room_id,
      game_id: game_id,
      game_rules: game_rules,
      players: players,
      player_ids_set: MapSet.new(player_ids_list),
      audience_members: audience_members,
      audience_member_ids_set: MapSet.new(audience_member_ids_list),
      game_view: :game_start,
      contestants: player_ids_list,
      sample_beats: sample_beats,
      scores: player_ids_list |> Enum.map(&{&1, 0}) |> Map.new(),
      view_deadline: Utils.calc_future_timestamp(game_rules.view_timeouts.game_start)
    }
  end

  @spec add_player(%GameInstance{}, %Player{}) :: instruction_map()
  def add_player(
        %GameInstance{players: players} = state,
        %Player{player_id: player_id} = player
      ) do
    updated_players = MapSet.put(players, player)
    updated_contestants = [player_id | state.contestants] |> MapSet.new() |> MapSet.to_list()

    %GameInstance{
      state
      | player_ids_set: MapSet.put(state.player_ids_set, player_id),
        players: updated_players,
        contestants: updated_contestants,
        ready_ups: MapSet.put(state.ready_ups, player_id),
        scores: Map.put(state.scores, player_id, 0)
    }
    |> as_instruction(sync?: true, view_change?: false)
  end

  @spec remove_player(%GameInstance{}, id()) :: instruction_map()
  def remove_player(%GameInstance{} = state, player_id) do
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

      %GameInstance{
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

  @spec add_audience_member(%GameInstance{}, %Player{}) :: instruction_map()
  def add_audience_member(
        %GameInstance{audience_members: audience_members} = state,
        %Player{player_id: audience_member_id} = audience_member
      ) do
    %GameInstance{
      state
      | audience_member_ids_set: MapSet.put(state.audience_member_ids_set, audience_member_id),
        audience_members: MapSet.put(audience_members, audience_member)
    }
    |> as_instruction(sync?: true, view_change?: false)
  end

  @spec remove_audience_member(%GameInstance{}, id()) :: instruction_map()
  def remove_audience_member(%GameInstance{} = state, player_id) do
    valid_audience_member_to_drop? = MapSet.member?(state.audience_member_ids_set, player_id)

    if valid_audience_member_to_drop? do
      updated_audience_members =
        state.audience_members
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

      %GameInstance{
        state
        | audience_member_ids_set: MapSet.delete(state.audience_member_ids_set, player_id),
          audience_members: updated_audience_members,
          votes: updated_votes
      }
    else
      state
    end
    |> as_instruction(sync?: valid_audience_member_to_drop?, view_change?: false)
  end

  @spec ready_up(%GameInstance{}, id()) :: instruction_map()
  defdelegate ready_up(state, player_id), to: Views.GameStart, as: :ready_up

  @spec add_recording(%GameInstance{}, any) :: instruction_map()
  defdelegate add_recording(state, recording), to: Views.Recording, as: :add_recording

  @spec cast_vote(%GameInstance{}, {id(), id()}) :: instruction_map()
  defdelegate cast_vote(state, vote), to: Views.PlaybackVoting, as: :cast_vote

  @spec advance_game_view(%GameInstance{}) :: instruction_map()
  @doc """
  Execute default behavior for ending current game view and advance to next game view
  """
  def advance_game_view(%GameInstance{game_view: game_view} = state) do
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

  def as_instruction(%GameInstance{} = state, sync?: sync?, view_change?: view_change?),
    do: %{sync_clients?: sync?, view_change?: view_change?, state: state}
end
