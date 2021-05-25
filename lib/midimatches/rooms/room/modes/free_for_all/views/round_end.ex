defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.RoundEnd do
  @moduledoc """
  Game logic specific to the round_end game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Types.PlayerOutcome,
    Types.RoundRecord,
    Types.WinResult,
    Utils
  }

  @type id() :: String.t()
  @type scores_map() :: %{required(id) => number}

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(
        %GameInstance{
          game_view: :round_end,
          round_num: round_num,
          game_rules: %{rounds_to_win: rounds_to_win}
        } = state
      ) do
    state = record_round(state)

    if round_num < rounds_to_win do
      reset_round(state)
    else
      game_over(state)
    end
  end

  @spec reset_round(%GameInstance{}) :: %GameInstance{}
  def reset_round(%GameInstance{
        room_id: room_id,
        game_id: game_id,
        game_rules: game_rules,
        players: players,
        player_ids_set: player_ids_set,
        audience_members: audience_members,
        audience_member_ids_set: audience_member_ids_set,
        contestants: contestants,
        view_counter: view_counter,
        scores: scores,
        sample_beats: sample_beats,
        round_records: round_records,
        round_num: round_num
      }) do
    %GameInstance{
      game_view: :round_start,
      room_id: room_id,
      game_id: game_id,
      game_rules: game_rules,
      players: players,
      player_ids_set: player_ids_set,
      audience_members: audience_members,
      audience_member_ids_set: audience_member_ids_set,
      view_counter: view_counter,
      contestants: contestants,
      scores: scores,
      sample_beats: sample_beats,
      round_records: round_records,
      round_num: round_num + 1
    }
  end

  @spec game_over(%GameInstance{}) :: %GameInstance{}
  def game_over(%GameInstance{scores: scores} = state) do
    game_winners = scores_to_win_result(scores)
    %GameInstance{state | game_view: :game_end, game_winners: game_winners}
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

  @spec record_round(%GameInstance{}) :: %GameInstance{}
  def record_round(%GameInstance{round_records: round_records} = state) do
    new_round_record = build_round_record(state)
    %GameInstance{state | round_records: [new_round_record | round_records]}
  end

  @spec build_round_record(%GameInstance{}) :: %RoundRecord{}
  @doc """
  Build a round record to preserve round-specific data for later persistence
  """
  def build_round_record(%GameInstance{
        round_num: round_num,
        sample_beats: sample_beats,
        round_winners: round_winners,
        player_ids_set: player_ids_set,
        votes: votes
      }) do
    backing_track =
      sample_beats
      |> Enum.at(round_num - 1, nil)

    backing_track_uuid =
      if is_nil(backing_track) do
        nil
      else
        backing_track.uuid
      end

    round_outcomes = build_round_outcomes(round_winners, player_ids_set, votes)

    %RoundRecord{
      round_num: round_num,
      round_outcomes: round_outcomes,
      backing_track_id: backing_track_uuid
    }
  end

  @spec build_round_outcomes(%WinResult{}, any(), any()) :: list(PlayerOutcome)
  defp build_round_outcomes(round_winners, player_ids_set, votes) do
    winning_player_ids_set = MapSet.new(round_winners.winners)

    winner_outcome =
      if MapSet.size(winning_player_ids_set) > 1 do
        :tied
      else
        :won
      end

    num_votes_per_player =
      votes
      |> Map.values()
      |> Enum.frequencies()

    player_ids_set
    |> Enum.to_list()
    |> Enum.map(fn player_id ->
      num_points = Map.get(num_votes_per_player, player_id, 0)

      if MapSet.member?(winning_player_ids_set, player_id) do
        %PlayerOutcome{
          player_id: player_id,
          event_type: :round,
          outcome: winner_outcome,
          num_points: num_points
        }
      else
        %PlayerOutcome{
          player_id: player_id,
          event_type: :round,
          outcome: :lost,
          num_points: num_points
        }
      end
    end)
  end
end
