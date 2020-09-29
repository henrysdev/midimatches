defmodule Progressions.TelemetryTest do
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias Progressions.Telemetry

  # TODO propagate these down via config
  @timestep_µs 50_000
  @clock_tolerance_µs 1_000

  test "monitor_timestep_sync logs warning when time difference out of threshold" do
    old_time = 1_600_993_322_016
    new_time = 1_600_993_922_016
    timestep = 100

    expected_log =
      Jason.encode!(%{
        "desc" => "time elapsed between consecutive timesteps outside of tolerated threshold.",
        "attrs" => %{
          "elapsed_µs" => abs(new_time - old_time - @timestep_µs),
          "tolerance_µs" => @clock_tolerance_µs,
          "timestep" => timestep
        }
      })

    log = capture_log(fn -> Telemetry.monitor_timestep_sync(new_time, old_time, 100) end)

    assert log =~ expected_log
  end

  test "monitor_timestep_sync does not log warning when time difference within threshold" do
    log = capture_log(fn -> Telemetry.monitor_timestep_sync(0, 0, 100) end)

    assert log == ""
  end
end
