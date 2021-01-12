defmodule Progressions.Rooms.Room.Game.ViewTimer do
  @moduledoc """
  View-specific timers and default behaviors
  """

  alias __MODULE__

  alias Progressions.{
    Pids,
    Rooms.Room.GameServer
  }

  use GenServer

  require Logger

  @type game_view() :: [
          :game_start | :round_start | :recording | :playback_voting | :round_end | :game_end
        ]

  # TODO replace with configs for view times
  @default_view_timeout 5 * 1000

  def start_link(args) do
    GenServer.start_link(ViewTimer, args)
  end

  def init([{room_id}]) do
    game_server = Pids.fetch!({:game_server, room_id})
    Pids.register({:view_timer, room_id}, self())

    {:ok, %{game_server: game_server}}
  end

  @spec schedule_view_timeout(pid(), game_view(), integer(), integer()) :: any
  def schedule_view_timeout(pid, view, view_counter, timeout \\ @default_view_timeout) do
    Process.send_after(pid, {:view_timeout, view, view_counter}, timeout)
  end

  def handle_info(
        {:view_timeout, timeout_view, view_counter},
        %{game_server: game_server} = state
      ) do
    GameServer.advance_from_game_view(game_server, timeout_view, view_counter)

    {:noreply, state}
  end
end
