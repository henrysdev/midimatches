defmodule MidimatchesWeb.ControllerHelpers do
  @moduledoc false

  import Phoenix.Controller
  import Plug.Conn

  @type input_rule() :: :bad_value | :invalid_length | :profanity | :out_of_valid_range

  @spec has_user_session?(Plug.Conn.t()) :: boolean()
  def has_user_session?(conn) do
    !(conn |> get_session(:user) |> is_nil())
  end

  def bad_json_request(conn, reason) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: reason})
  end

  @spec invalid_value_error(String.t(), input_rule()) :: String.t()
  def invalid_value_error(field, violated_rule \\ :bad_value) do
    "invalid value for #{field} (#{violated_rule})"
  end
end
