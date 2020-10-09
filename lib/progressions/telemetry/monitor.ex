defmodule Progressions.Telemetry.Monitor do
  @moduledoc """
  The Monitor module contains functions used to measure and
  monitor specific performance concerns of the application.
  """
  require Logger

  # TODO propagate these down via config
  @timestep_µs 50_000
  @clock_tolerance_µs 1_000

  @doc """
  Monitor for alerting in case of timestep clock inaccuracy
  """
  @spec check_clock_precision(number(), number(), number()) :: nil
  def check_clock_precision(new, old, timestep)
      when abs(new - old - @timestep_µs) > @clock_tolerance_µs and
             new > @timestep_µs and old > @timestep_µs do
    elapsed = abs(new - old - @timestep_µs)

    message =
      "time elapsed between consecutive timesteps outside of tolerated threshold: " <>
        "elapsed_µs=#{elapsed}, tolerance_threshold_µs=#{@clock_tolerance_µs}, timestep=#{
          timestep
        }"

    Logger.warn(message)
  end

  def check_clock_precision(_, _, _), do: nil

  # @spec check_timesteps_sync(list(), integer()) :: nil
  def check_timesteps_sync do
    # TODO implement check for timesteps that are catching up. Can be detecting by
    # timesteps slices that are from a timestep before current
  end
end
