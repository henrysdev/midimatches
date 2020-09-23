defmodule Progressions.Telemetry do
  require Logger

  # TODO propagate these down via config
  @timestep_µs 50000
  @clock_tolerance_µs 500

  def monitor_timestep_sync(new, old, timestep)
      when abs(new - old - @timestep_µs) > @clock_tolerance_µs do
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
