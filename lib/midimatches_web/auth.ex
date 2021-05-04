defmodule MidimatchesWeb.Auth do
  @moduledoc """
  Provides set of functions around authentication
  """
  import Plug.Conn

  alias Midimatches.Utils

  alias MidimatchesDb, as: Db

  @max_token_age 864_000

  @spec new_bearer_token(Plug.Conn.t(), MidimatchesDb.User.t()) :: Plug.Conn.t()
  def new_bearer_token(conn, %Db.User{uuid: user_id}) do
    {:ok, new_token_serial} = Db.Users.user_increment_session(user_id)

    new_bearer_token =
      Phoenix.Token.sign(MidimatchesWeb.Endpoint, "user bearer token",
        user_id: user_id,
        session_id: new_token_serial
      )

    assign(conn, :user_bearer_token, new_bearer_token)
  end

  @spec verify_bearer_token(Plug.Conn.t(), any()) :: Plug.Conn.t()
  def verify_bearer_token(conn, _ \\ nil) do
    if has_bearer_token?(conn) do
      case conn.assigns[:user_bearer_token] |> verify_phx_token() do
        {:ok, [user_id: user_id, session_id: session_id]} ->
          if fresh_token?(user_id, session_id) do
            assign(conn, :auth_user_id, user_id)
          else
            auth_error(conn)
          end

        _ ->
          auth_error(conn)
      end
    else
      auth_error(conn)
    end
  end

  @spec has_bearer_token?(Plug.Conn.t()) :: boolean()
  def has_bearer_token?(conn) do
    conn.assigns[:user_bearer_token] != nil
  end

  @spec valid_bearer_token?(any()) :: boolean()
  def valid_bearer_token?(bearer_token) do
    case verify_phx_token(bearer_token) do
      {:ok, [user_id: user_id, session_id: session_id]} ->
        fresh_token?(user_id, session_id)

      _ ->
        false
    end
  end

  defp verify_phx_token(token) do
    Phoenix.Token.verify(MidimatchesWeb.Endpoint, "user bearer token", token,
      max_age: @max_token_age
    )
  end

  defp auth_error(conn) do
    conn
    |> send_resp(:unauthorized, "User not authorized")
    |> halt()
  end

  defp fresh_token?(user_id, session_id) do
    {:ok, %Db.User{token_serial: token_serial}} = Db.Users.get_user_by(:uuid, user_id)
    session_id == token_serial
  end

  # Socket auth for XSS
  def auth_user_socket(conn, _) do
    rand_id = Utils.gen_uuid()
    assign(conn, :current_user, %{id: rand_id})
  end

  def put_user_socket_token(conn, _) do
    if current_user = conn.assigns[:current_user] do
      token = Phoenix.Token.sign(conn, "user socket", current_user.id)
      assign(conn, :user_token, token)
    else
      conn
    end
  end
end
