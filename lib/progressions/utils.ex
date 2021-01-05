defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Progressions.{
    Rooms.Room.GameServer,
    Types.Musician
  }

  def calc_deadline(_curr_timestep, _loop_start_timestep, loop_length) when loop_length <= 0 do
    {:error, "loop length must be greater than zero"}
  end

  def calc_deadline(curr_timestep, loop_start_timestep, loop_length) do
    loop_rem = rem(curr_timestep - loop_start_timestep, loop_length)

    case loop_rem do
      _ when curr_timestep < loop_start_timestep -> loop_start_timestep
      0 -> curr_timestep + loop_length
      loop_rem -> curr_timestep + loop_length - loop_rem
    end
  end

  @spec server_to_client_game_state(GameServer.t()) :: map()
  @doc """
  transform game server state into update payload for clients
  """
  def server_to_client_game_state(%GameServer{
        room_id: room_id,
        round_recording_start_time: round_recording_start_time,
        timestep_size: timestep_size,
        quantization_threshold: quantization_threshold,
        rounds_to_win: rounds_to_win,
        game_size_num_players: game_size_num_players,
        contestants_per_round: contestants_per_round,
        musicians: musicians,
        round: round,
        scores: scores,
        winner: winner,
        ready_ups: ready_ups,
        recordings: recordings,
        votes: votes
      }) do
    # votes are secret - should not expose actual votes to clients, only progress on
    # voting as a whole
    num_votes_cast =
      votes
      |> Map.keys()
      |> length()

    # should only expose very limited info about musicians
    shallow_musicians =
      musicians
      |> Map.values()
      |> Enum.map(fn %Musician{musician_id: musician_id} ->
        %{musician_id: musician_id}
      end)

    %{
      room_id: room_id,
      round_recording_start_time: round_recording_start_time,
      timestep_size: timestep_size,
      quantization_threshold: quantization_threshold,
      rounds_to_win: rounds_to_win,
      game_size_num_players: game_size_num_players,
      contestants_per_round: contestants_per_round,
      musicians: shallow_musicians,
      round: round,
      scores: scores,
      winner: winner,
      ready_ups: ready_ups,
      recordings: recordings,
      num_votes_cast: num_votes_cast
    }
  end
end
