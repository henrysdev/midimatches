defmodule Progressions.Telemetry.Monitor do
  @moduledoc """
  The Monitor module contains functions used to measure and
  monitor specific performance concerns of the application.
  """
  require Logger

  @clock_tolerance_us 1_000

  @doc """
  Monitor for alerting in case of timestep clock inaccuracy
  """
  @spec check_clock_precision(number(), number(), number(), integer()) :: nil
  def check_clock_precision(new, old, timestep, timestep_us)
      when abs(new - old - timestep_us) > @clock_tolerance_us and
             new > timestep_us and old > timestep_us do
    elapsed = abs(new - old - timestep_us)

    message =
      "time elapsed between consecutive timesteps outside of tolerated threshold: " <>
        "elapsed_us=#{elapsed}, tolerance_threshold_us=#{@clock_tolerance_us}, timestep=#{
          timestep
        }"

    Logger.warn(message)
  end

  def check_clock_precision(_, _, _, _), do: nil
end
