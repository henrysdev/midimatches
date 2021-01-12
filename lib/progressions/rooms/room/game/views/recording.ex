defmodule Progressions.Rooms.Room.Game.Views.Recording do
  @moduledoc """
  Game logic specific to the recording game view
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
  def advance_view(%GameServer{game_view: :recording} = state) do
    # TODO handle outstanding recordings
    %GameServer{state | game_view: :playback_voting}
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
        |> GameLogic.as_instruction(sync?: true, view_change?: false)

      # last needed recording - store recording and transition to playback voting server state
      {true, true} ->
        %GameServer{state | recordings: Map.put(recordings, musician_id, recording)}
        |> advance_view()
        |> GameLogic.as_instruction(sync?: true, view_change?: true)

      # invalid vote - return state unchanged
      _ ->
        GameLogic.as_instruction(state, sync?: false, view_change?: false)
    end
  end
end
