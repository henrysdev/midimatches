defmodule Progressions.Telemetry.MonitorTest do
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias Progressions.Telemetry.Monitor

  # TODO propagate these down via config
  @timestep_µs 50_000
  @clock_tolerance_µs 1_000

  test "check_clock_precision logs warning when time difference out of threshold" do
    old_time = 1_600_993_322_016
    new_time = 1_600_993_922_016
    timestep = 100
    elapsed = abs(new_time - old_time - @timestep_µs)

    expected_log =
      "time elapsed between consecutive timesteps outside of tolerated threshold: " <>
        "elapsed_µs=#{elapsed}, tolerance_threshold_µs=#{@clock_tolerance_µs}, timestep=#{
          timestep
        }"

    log = capture_log(fn -> Monitor.check_clock_precision(new_time, old_time, 100) end)

    assert log =~ expected_log
  end

  test "check_clock_precision does not log warning when time difference within threshold" do
    log = capture_log(fn -> Monitor.check_clock_precision(0, 0, 100) end)

    assert log == ""
  end
end
