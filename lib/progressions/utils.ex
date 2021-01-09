defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Progressions.{
    Rooms.Room.NewGameServer,
    Types.ClientGameState
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

  # @spec server_to_client_game_state(GameServer.t()) :: map()
  # @doc """
  # transform game server state into update payload for clients
  # """
  # def server_to_client_game_state(%GameServer{
  #       room_id: room_id,
  #       round_recording_start_time: round_recording_start_time,
  #       timestep_size: timestep_size,
  #       quantization_threshold: quantization_threshold,
  #       rounds_to_win: rounds_to_win,
  #       game_size_num_players: game_size_num_players,
  #       musicians: musicians,
  #       round: round,
  #       scores: scores,
  #       winner: winner,
  #       ready_ups: ready_ups,
  #       recordings: recordings,
  #       votes: votes
  #     }) do
  #   # votes are secret - should not expose actual votes to clients, only progress on
  #   # voting as a whole
  #   num_votes_cast =
  #     votes
  #     |> Map.keys()
  #     |> length()

  #   # should only expose very limited info about musicians
  #   shallow_musicians =
  #     musicians
  #     |> Map.values()
  #     |> Enum.map(fn %Musician{musician_id: musician_id} ->
  #       %{musician_id: musician_id}
  #     end)

  #   %{
  #     room_id: room_id,
  #     round_recording_start_time: round_recording_start_time,
  #     timestep_size: timestep_size,
  #     quantization_threshold: quantization_threshold,
  #     rounds_to_win: rounds_to_win,
  #     game_size_num_players: game_size_num_players,
  #     musicians: shallow_musicians,
  #     round: round,
  #     scores: scores,
  #     winner: winner,
  #     ready_ups: ready_ups,
  #     recordings: recordings,
  #     num_votes_cast: num_votes_cast
  #   }
  # end

  @spec new_server_to_client_game_state(%NewGameServer{}) :: any
  @doc """
  transform game server state into update payload for clients
  """
  def new_server_to_client_game_state(%NewGameServer{} = server_state) do
    # votes are secret - should not expose actual votes to clients, only progress on
    # voting as a whole
    num_votes_cast =
      server_state.votes
      |> Map.keys()
      |> length()

    musicians_list =
      server_state.musicians
      |> MapSet.to_list()

    ready_ups_list =
      server_state.ready_ups
      |> MapSet.to_list()

    %ClientGameState{
      # static fields
      # game_size_num_players: server_state.game_rules.game_size_num_players,
      # timestep_size: server_state.game_rules.timestep_size,
      # solo_time_limit: server_state.game_rules.solo_time_limit,
      # quantization_threshold: server_state.game_rules.quantization_threshold,
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,

      # dynamic fields
      musicians: musicians_list,
      num_votes_cast: num_votes_cast,
      ready_ups: ready_ups_list,
      recordings: server_state.recordings,
      round_recording_start_time: server_state.round_recording_start_time,
      winner: server_state.winner,
      contestants: server_state.contestants,
      judges: server_state.judges
    }
  end
end
