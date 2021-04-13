defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.Recording do
  @moduledoc """
  Game logic specific to the recording game view
  """

  alias Midimatches.{
    Rooms.Room.GameLogic,
    Rooms.Room.GameServer,
    Types.GameRules,
    Types.GameRules.ViewTimeouts
  }

  @type id() :: String.t()
  @type recording_status() :: :bad_recording | :valid_recording | :last_valid_recording
  @type instruction_map() :: %{
          sync_clients?: boolean(),
          view_change?: boolean(),
          state: %GameServer{}
        }
  @type record_payload() :: {id(), any}

  @spec advance_view(%GameServer{}) :: %GameServer{}
  def advance_view(
        %GameServer{
          recordings: recordings,
          game_view: :recording,
          game_rules:
            %GameRules{
              solo_time_limit: solo_time_limit,
              view_timeouts: view_timeouts
            } = game_rules
        } = state
      ) do
    # handle special case where we want to calculate length of playback voting timeout
    # based on how many players are in the game
    number_of_recordings = recordings |> Map.keys() |> length()

    state = %GameServer{
      state
      | game_rules: %GameRules{
          game_rules
          | view_timeouts: %ViewTimeouts{
              view_timeouts
              | playback_voting: number_of_recordings * solo_time_limit
            }
        }
    }

    %GameServer{state | game_view: :playback_voting}
  end

  @spec add_recording(%GameServer{}, any) :: instruction_map()
  @doc """
  Handle player event where a contestant submits a recording.
  """
  def add_recording(%GameServer{} = state, record_payload) do
    case recording_status(state, record_payload) do
      # last needed recording - store recording and transition to playback voting server state
      :last_valid_recording ->
        state
        |> valid_recording(record_payload)
        |> advance_view()
        |> GameLogic.as_instruction(sync?: true, view_change?: true)

      # valid recording - store recording in game server state
      :valid_recording ->
        state
        |> valid_recording(record_payload)
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # invalid vote - return state unchanged
      _bad_recording ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end

  @spec recording_status(%GameServer{}, record_payload()) :: recording_status()
  defp recording_status(
         %GameServer{contestants: contestants, recordings: recordings},
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

  @spec valid_recording(%GameServer{}, record_payload()) :: %GameServer{}
  def valid_recording(%GameServer{recordings: recordings} = state, {player_id, recording}) do
    %GameServer{state | recordings: Map.put(recordings, player_id, recording)}
  end

  # Auto recording logic (save logic for bot usage)
  # - to be called from advance_view()

  # @empty_recording %{
  #   timestep_slices: []
  # }
  # @spec auto_create_recordings(%GameServer{}) :: %GameServer{}
  # defp auto_create_recordings(
  #        %GameServer{
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

  # @spec simulate_add_recording(%GameServer{}, any) :: %GameServer{}
  # defp simulate_add_recording(%GameServer{} = state, record_payload) do
  #   case recording_status(state, record_payload) do
  #     :last_valid_recording ->
  #       state
  #       |> valid_recording(record_payload)
  #       |> advance_view()

  #     :valid_recording ->
  #       state
  #       |> valid_recording(record_payload)

  #     _bad_recording ->
  #       GameLogic.as_instruction(state, sync?: false, view_change?: false)
  #   end
  # end
end
