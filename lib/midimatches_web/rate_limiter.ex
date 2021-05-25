defmodule MidimatchesWeb.RateLimiter do
  @moduledoc """
  Provides set of functions around authentication
  """
  import Plug.Conn

  @default_bucket_time 10_000
  @default_request_limit 10

  @doc """
  Plug to check rate limit for a given endpoint
  """
  def rate_limit(
        %Plug.Conn{request_path: request_path} = conn,
        request_limit: request_limit,
        bucket_time: bucket_time,
        auth_keyed?: auth_keyed?
      ) do
    bucket_key =
      if auth_keyed? do
        auth_user = conn.assigns[:auth_user]
        "#{request_path}:#{auth_user.user_id}"
      else
        "#{request_path}"
      end

    case check_rate(bucket_key, bucket_time, request_limit) do
      {:ok, _call_count} ->
        conn

      {:error, _call_limit} ->
        rate_limit_error(conn)
    end
  end

  def rate_limit_error(conn) do
    conn
    |> send_resp(429, "You are sending too many requests")
    |> halt()
  end

  def check_rate(
        bucket_key,
        bucket_time \\ @default_bucket_time,
        request_limit \\ @default_request_limit
      ) do
    ExRated.check_rate(bucket_key, bucket_time, request_limit)
  end
end
