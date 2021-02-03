defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """

  alias Progressions.{
    Rooms.Room.GameServer,
    Types.ClientGameState
  }

  @spec gen_random_string(number) :: binary()
  @doc """
  Generate a random string of the given length
  """
  def gen_random_string(length) do
    :crypto.strong_rand_bytes(length) |> Base.url_encode64() |> binary_part(0, length)
  end

  @spec server_to_client_game_state(%GameServer{}) :: any
  @doc """
  Transform game server state into update payload for clients
  """
  def server_to_client_game_state(%GameServer{} = server_state) do
    # votes are secret - should not expose actual votes to clients, only progress on
    # voting as a whole
    num_votes_cast =
      server_state.votes
      |> Map.keys()
      |> length()

    players_list =
      server_state.players
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
      game_view: server_state.game_view,
      players: players_list,
      num_votes_cast: num_votes_cast,
      ready_ups: ready_ups_list,
      recordings: server_state.recordings,
      round_recording_start_time: server_state.round_recording_start_time,
      winner: winner,
      contestants: server_state.contestants,
      scores: server_state.scores,
      round_num: server_state.round_num
    }
  end
end
