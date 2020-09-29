defmodule Progressions.Telemetry do
  require Logger

  # TODO propagate these down via config
  @timestep_µs 50_000
  @clock_tolerance_µs 1_000

  @doc """
  Monitor for alerting in case of timestep clock inaccuracy
  """
  @spec monitor_timestep_sync(number(), number(), number()) :: nil
  def monitor_timestep_sync(new, old, timestep)
      when abs(new - old - @timestep_µs) > @clock_tolerance_µs and
             new > @timestep_µs and old > @timestep_µs do
    elapsed = abs(new - old - @timestep_µs)

    message =
      Jason.encode!(%{
        "desc" => "time elapsed between consecutive timesteps outside of tolerated threshold.",
        "attrs" => %{
          "elapsed_µs" => elapsed,
          "tolerance_µs" => @clock_tolerance_µs,
          "timestep" => timestep
        }
      })

    Logger.warn(message)
  end

  def monitor_timestep_sync(_, _, _), do: nil
end
