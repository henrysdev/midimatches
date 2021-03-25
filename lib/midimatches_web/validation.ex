defmodule MidimatchesWeb.Validation do
  @moduledoc false

  @type input_rule() :: :bad_value | :invalid_length | :profanity | :out_of_valid_range

  @spec invalid_value_error(String.t(), input_rule()) :: String.t()
  def invalid_value_error(field, violated_rule \\ :bad_value) do
    "invalid value for #{field} (#{violated_rule})"
  end
end
