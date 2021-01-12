defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Progressions.{
    Rooms.Room.GameServer,
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

  @spec new_server_to_client_game_state(%GameServer{}) :: any
  @doc """
  transform game server state into update payload for clients
  """
  def new_server_to_client_game_state(%GameServer{} = server_state) do
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

    winner =
      if is_nil(server_state.winner) do
        server_state.winner
      else
        {winner, num_votes} = server_state.winner

        %{
          winner_id: winner,
          num_votes: num_votes
        }
      end

    %ClientGameState{
      # static fields
      game_rules: server_state.game_rules,
      room_id: server_state.room_id,

      # dynamic fields
      musicians: musicians_list,
      num_votes_cast: num_votes_cast,
      ready_ups: ready_ups_list,
      recordings: server_state.recordings,
      round_recording_start_time: server_state.round_recording_start_time,
      winner: winner,
      contestants: server_state.contestants,
      judges: server_state.judges
    }
  end
end
