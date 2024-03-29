defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.Recording do
  @moduledoc """
  Game logic specific to the recording game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Rooms.Room.Modes.FreeForAll.FreeForAllLogic,
    Types.GameRules,
    Types.GameRules.ViewTimeouts,
    Utils
  }

  @type id() :: String.t()
  @type recording_status() :: :bad_recording | :valid_recording | :last_valid_recording
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameInstance{}
        }
  @type record_payload() :: {id(), any}

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(
        %GameInstance{
          recordings: recordings,
          game_view: :recording,
          game_rules:
            %GameRules{
              view_timeouts: view_timeouts
            } = game_rules,
          sample_beats: sample_beats,
          round_num: round_num
        } = state
      ) do
    current_sample_beat = Enum.at(sample_beats, round_num - 1)

    valid_recordings =
      recordings
      |> Map.to_list()
      |> Enum.reject(fn {_key, rec} -> Utils.empty_recording?(rec) end)
      |> Enum.into(%{})

    playback_voting_timeout =
      calc_playback_voting_timeout(map_size(valid_recordings), current_sample_beat)

    state = %GameInstance{
      state
      | game_rules: %GameRules{
          game_rules
          | view_timeouts: %ViewTimeouts{
              view_timeouts
              | playback_voting: playback_voting_timeout
            }
        },
        recordings: valid_recordings
    }

    %GameInstance{state | game_view: :playback_voting}
  end

  @spec add_recording(%GameInstance{}, any) :: instruction_map()
  @doc """
  Handle player event where a contestant submits a recording.
  """
  def add_recording(%GameInstance{} = state, record_payload) do
    case recording_status(state, record_payload) do
      # last needed recording - store recording and transition to playback voting server state
      :last_valid_recording ->
        state
        |> valid_recording(record_payload)
        |> advance_view()
        |> FreeForAllLogic.as_instruction(sync?: true, view_change?: true)

      # valid recording - store recording in game server state
      :valid_recording ->
        state
        |> valid_recording(record_payload)
        |> FreeForAllLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _bad_recording ->
        FreeForAllLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end

  defp calc_playback_voting_timeout(num_valid_recordings, current_sample_beat) do
    case num_valid_recordings do
      # skip playback voting view if no valid recordings (timeout immediately)
      0 -> 5_000
      _n -> Utils.calc_sample_time(current_sample_beat.bpm) * num_valid_recordings + 10_000
    end
  end

  @spec recording_status(%GameInstance{}, record_payload()) :: recording_status()
  defp recording_status(
         %GameInstance{contestants: contestants, recordings: recordings},
         {player_id, _recording}
       ) do
    valid_recording? =
      Enum.member?(contestants, player_id) and
        !Map.has_key?(recordings, player_id)

    last_recording? = length(contestants) - map_size(recordings) == 1

    case {valid_recording?, last_recording?} do
      {true, true} -> :last_valid_recording
      {true, false} -> :valid_recording
      _ -> :bad_recording
    end
  end

  @spec valid_recording(%GameInstance{}, record_payload()) :: %GameInstance{}
  def valid_recording(%GameInstance{recordings: recordings} = state, {player_id, recording}) do
    %GameInstance{state | recordings: Map.put(recordings, player_id, recording)}
  end

  # Auto recording logic (save logic for bot usage)
  # - to be called from advance_view()

  # @empty_recording %{
  #   timestep_slices: []
  # }
  # @spec auto_create_recordings(%GameInstance{}) :: %GameInstance{}
  # defp auto_create_recordings(
  #        %GameInstance{
  #          contestants: contestants,
  #          recordings: recordings,
  #          game_view: :recording
  #        } = state
  #      ) do
  #   # simulate missing recording submissions with empty recordings
  #   missing_contestants =
  #     contestants
  #     |> Stream.reject(&(recordings |> Map.keys() |> Enum.member?(&1)))

  #   Enum.reduce(missing_contestants, state, fn contestant_id, acc_state ->
  #     recording_payload = {contestant_id, @empty_recording}
  #     simulate_add_recording(acc_state, recording_payload)
  #   end)
  # end

  # @spec simulate_add_recording(%GameInstance{}, any) :: %GameInstance{}
  # defp simulate_add_recording(%GameInstance{} = state, record_payload) do
  #   case recording_status(state, record_payload) do
  #     :last_valid_recording ->
  #       state
  #       |> valid_recording(record_payload)
  #       |> advance_view()

  #     :valid_recording ->
  #       state
  #       |> valid_recording(record_payload)

  #     _bad_recording ->
  #       FreeForAllLogic.as_instruction(state, sync?: false, view_change?: false)
  #   end
  # end
end
