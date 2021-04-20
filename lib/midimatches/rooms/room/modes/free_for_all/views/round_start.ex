defmodule Midimatches.Rooms.Room.Modes.FreeForAll.Views.RoundStart do
  @moduledoc """
  Game logic specific to the round_start game view
  """

  alias Midimatches.{
    Rooms.Room.GameInstance,
    Utils,
    Types.GameRules,
    Types.GameRules.ViewTimeouts
  }

  @spec advance_view(%GameInstance{}) :: %GameInstance{}
  def advance_view(
        %GameInstance{
          game_view: :round_start,
          game_rules: %GameRules{view_timeouts: view_timeouts} = game_rules,
          sample_beats: sample_beats,
          round_num: round_num
        } = state
      ) do
    current_sample_beat = Enum.at(sample_beats, round_num - 1)
    recording_view_timeout = calc_recording_deadline(current_sample_beat)

    %GameInstance{
      state
      | game_view: :recording,
        round_recording_start_time: Utils.curr_utc_timestamp(),
        game_rules: %GameRules{
          game_rules
          | view_timeouts: %ViewTimeouts{
              view_timeouts
              | recording: recording_view_timeout
            }
        }
    }
  end

  defp calc_recording_deadline(current_sample_beat) do
    sample_length = 60 / current_sample_beat.bpm
    sample_length = floor(sample_length * 4 * 4 * 1000)
    warm_up_time = sample_length
    recording_time = sample_length
    recv_buffer = 5_000
    send_buffer = 2_000
    recv_buffer + warm_up_time + recording_time + send_buffer
  end
end
