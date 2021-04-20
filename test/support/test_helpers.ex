defmodule Midimatches.TestHelpers do
  @moduledoc """
  This module provides convenience methods for writing unit tests for this project
  """

  alias MidimatchesDb.{
    BackingTrack,
    BackingTracks
  }

  alias Midimatches.{
    Rooms,
    Rooms.Room.GameInstance,
    Rooms.RoomServer,
    Types.Loop
  }

  def populate_backing_tracks_table(count \\ 10) do
    for _ <- 1..count do
      %BackingTrack{
        name: UUID.uuid4(),
        file_url: UUID.uuid4(),
        author: UUID.uuid4(),
        bpm: 90,
        musical_key: "Em"
      }
      |> BackingTracks.create_backing_track()
    end
  end

  def flush_user_cache do
    if :ets.whereis(:user_cache) != :undefined do
      :ets.match_delete(:user_cache, {:"$1", :"$2"})
    else
      :ok
    end
  end

  def flush_banned_users do
    if :ets.whereis(:banned_users) != :undefined do
      :ets.match_delete(:banned_users, {:"$1"})
    else
      :ok
    end
  end

  def teardown_rooms do
    pids = room_pids()

    Enum.each(pids, &DynamicSupervisor.terminate_child(Rooms, &1))

    unregister_keys(pids)
  end

  def add_players(game_server, players) do
    Enum.each(players, fn player ->
      RoomServer.add_player(game_server, player)
    end)

    game_server
  end

  def ready_up_players(game_server, player_ids) do
    Enum.each(player_ids, fn m_id ->
      GameInstance.client_event(game_server, {:ready_up, m_id})
    end)

    game_server
  end

  def record_players(game_server, player_ids) do
    Enum.each(player_ids, fn m_id ->
      GameInstance.client_event(
        game_server,
        {:record,
         {m_id,
          %Loop{
            start_timestep: 0,
            length: 4,
            timestep_slices: []
          }}}
      )
    end)

    game_server
  end

  def vote_for_players(game_server, player_votes) do
    player_votes
    |> Map.to_list()
    |> Enum.each(fn {m_id, m_vote} ->
      GameInstance.client_event(game_server, {:vote, {m_id, m_vote}})
    end)

    game_server
  end

  defp room_pids do
    Rooms.list_rooms()
    |> Enum.map(fn {_, pid, _, _} -> pid end)
  end

  defp unregister_keys(pids) do
    pids
    |> Enum.reduce([], fn pid, acc ->
      keys = Registry.keys(ProcessRegistry, pid)
      keys ++ acc
    end)
    |> Enum.each(&Registry.unregister(ProcessRegistry, &1))
  end
end
