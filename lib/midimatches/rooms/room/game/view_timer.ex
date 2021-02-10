defmodule Midimatches.Rooms.Room.Game.ViewTimer do
  @moduledoc """
  View-specific timers and default behaviors
  """

  alias __MODULE__

  alias Midimatches.{
    Pids,
    Rooms.Room.GameServer
  }

  use GenServer

  require Logger

  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]

  def start_link(args) do
    GenServer.start_link(ViewTimer, args)
  end

  def init([{room_id}]) do
    Pids.register({:view_timer, room_id}, self())

    {:ok, %{}}
  end

  @spec schedule_view_timeout(pid(), game_view(), integer(), integer(), pid()) :: any
  def schedule_view_timeout(pid, view, view_counter, timeout, game_server_pid) do
    Process.send_after(pid, {:view_timeout, view, view_counter, game_server_pid}, timeout)
  end

  def handle_info(
        {:view_timeout, timeout_view, view_counter, game_server_pid},
        state
      ) do
    GameServer.advance_from_game_view(game_server_pid, timeout_view, view_counter)

    {:noreply, state}
  end
end
