defmodule Midimatches.LeaderboardUpdater do
  @moduledoc """
  Provides an actor-based timer for refreshing the rankings leaderboard
  """
  alias MidimatchesDb.Leaderboard

  alias __MODULE__

  use GenServer

  require Logger

  @default_update_cadence 3_600_000

  def start_link(args) do
    GenServer.start_link(LeaderboardUpdater, args)
  end

  def init(_args) do
    Process.send_after(self(), {:update_leaderboard}, @default_update_cadence)
    {:ok, %{}}
  end

  def handle_info({:update_leaderboard}, state) do
    update_leaderboard()
    Process.send_after(self(), {:update_leaderboard}, @default_update_cadence)
    {:noreply, state}
  end

  @spec update_leaderboard() :: :ok
  @doc """
  Triggers update of leaderboard table
  """
  def update_leaderboard do
    Logger.info("started refreshing leaderboard...")
    Leaderboard.refresh_leaderboard()
    Logger.info("finished refreshing leaderboard")
  end
end
