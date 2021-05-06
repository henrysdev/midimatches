defmodule MidimatchesWeb.ControllerHelpers do
  @moduledoc false

  import Plug.Conn
  import Phoenix.Controller

  @type input_rule() :: :bad_value | :invalid_length | :profanity | :out_of_valid_range

  @spec invalid_value_error(String.t(), input_rule()) :: String.t()
  def invalid_value_error(field, violated_rule \\ :bad_value) do
    "invalid value for #{field} (#{violated_rule})"
  end

  @spec bad_json_request(Plug.Conn.t(), any()) :: Plug.Conn.t()
  def bad_json_request(conn, error_reason) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: inspect(error_reason)})
  end
end
