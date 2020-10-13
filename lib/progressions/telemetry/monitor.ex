defmodule Progressions.Telemetry.Monitor do
  @moduledoc """
  The Monitor module contains functions used to measure and
  monitor specific performance concerns of the application.
  """
  require Logger

  # TODO propagate these down via config
  @timestep_us 50_000
  @clock_tolerance_us 1_000

  @doc """
  Monitor for alerting in case of timestep clock inaccuracy
  """
  @spec check_clock_precision(number(), number(), number()) :: nil
  def check_clock_precision(new, old, timestep)
      when abs(new - old - @timestep_us) > @clock_tolerance_us and
             new > @timestep_us and old > @timestep_us do
    elapsed = abs(new - old - @timestep_us)

    message =
      "time elapsed between consecutive timesteps outside of tolerated threshold: " <>
        "elapsed_us=#{elapsed}, tolerance_threshold_us=#{@clock_tolerance_us}, timestep=#{
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
