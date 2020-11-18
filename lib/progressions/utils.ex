defmodule Progressions.Utils do
  @moduledoc """
  Provides common utility helper methods
  """
  def calc_deadline(_curr_timestep, _loop_start_timestep, loop_length) when loop_length <= 0 do
    {:error, "loop length must be greater than zero"}
  end

  def calc_deadline(curr_timestep, loop_start_timestep, loop_length) do
    loop_rem = rem(curr_timestep - loop_start_timestep, loop_length)

    case loop_rem do
      _ when curr_timestep < loop_start_timestep -> loop_start_timestep
      0 -> curr_timestep + loop_length
      loop_rem -> curr_timestep + loop_length - loop_rem
    end
  end
end
