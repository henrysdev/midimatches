defmodule Progressions.TestHelpers do
  @moduledoc """
  This module provides convenience methods for writing unit tests for this project
  """

  alias Progressions.{
    Persistence,
    Rooms,
    Rooms.Room.GameServerAPI,
    Types.Loop,
    Types.Musician
  }

  def teardown_rooms do
    pids = room_pids()

    Enum.each(pids, &DynamicSupervisor.terminate_child(Rooms, &1))

    reset_persistence()
    unregister_keys(pids)
  end

  def add_musicians(game_server, musician_ids) do
    Enum.each(musician_ids, fn m_id ->
      GameServerAPI.add_musician(game_server, %Musician{
        musician_id: m_id
      })
    end)

    game_server
  end

  def ready_up_musicians(game_server, musician_ids) do
    Enum.each(musician_ids, fn m_id ->
      GameServerAPI.musician_ready_up(game_server, m_id)
    end)

    game_server
  end

  def record_musicians(game_server, musician_ids) do
    Enum.each(musician_ids, fn m_id ->
      GameServerAPI.musician_recording(
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

  def vote_for_musicians(game_server, musician_votes) do
    musician_votes
    |> Map.to_list()
    |> Enum.each(fn {m_id, m_vote} ->
      GameServerAPI.musician_vote(game_server, m_id, m_vote)
    end)

    game_server
  end

  defp room_pids do
    Rooms.list_rooms()
    |> Enum.map(fn {_, pid, _, _} -> pid end)
  end

  defp reset_persistence do
    Process.exit(Process.whereis(Persistence), :normal)
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
