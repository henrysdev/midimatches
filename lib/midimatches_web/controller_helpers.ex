defmodule MidimatchesWeb.ControllerHelpers do
  import Plug.Conn
  @moduledoc false

  @type input_rule() :: :bad_value | :invalid_length | :profanity | :out_of_valid_range

  @spec has_user_session?(Plug.Conn.t()) :: boolean()
  def has_user_session?(conn) do
    !(conn |> get_session(:user) |> is_nil())
  end

  @spec invalid_value_error(String.t(), input_rule()) :: String.t()
  def invalid_value_error(field, violated_rule \\ :bad_value) do
    "invalid value for #{field} (#{violated_rule})"
  end
end
