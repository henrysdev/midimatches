defmodule Midimatches.TestHelpers do
  @moduledoc """
  This module provides convenience methods for writing unit tests for this project
  """

  alias Midimatches.{
    Rooms,
    Rooms.Room.GameServer,
    Rooms.RoomServer,
    Types.Loop
  }

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
      GameServer.player_ready_up(game_server, m_id)
    end)

    game_server
  end

  def record_players(game_server, player_ids) do
    Enum.each(player_ids, fn m_id ->
      GameServer.player_recording(
        game_server,
        m_id,
        %Loop{
          start_timestep: 0,
          length: 4,
          timestep_slices: []
        }
      )
    end)

    game_server
  end

  def vote_for_players(game_server, player_votes) do
    player_votes
    |> Map.to_list()
    |> Enum.each(fn {m_id, m_vote} ->
      GameServer.player_vote(game_server, m_id, m_vote)
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
