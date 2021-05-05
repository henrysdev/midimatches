defmodule MidimatchesWeb.Auth do
  @moduledoc """
  Provides set of functions around authentication
  """
  import Plug.Conn
  import Phoenix.Controller
  alias MidimatchesWeb.Router.Helpers, as: Routes

  alias Midimatches.Utils

  alias MidimatchesDb, as: Db

  require Logger

  @max_token_age 864_000

  @type id() :: String.t()

  @spec put_bearer_token(Plug.Conn.t(), id()) :: Plug.Conn.t()
  def put_bearer_token(conn, user_id) do
    {:ok, new_token_serial} = Db.Users.user_increment_session(user_id)

    token =
      Phoenix.Token.sign(MidimatchesWeb.Endpoint, "user bearer token",
        user_id: user_id,
        session_id: new_token_serial
      )

    conn
    |> put_session(:user_bearer_token, token)
  end

  @spec auth_conn(Plug.Conn.t(), list(atom)) :: Plug.Conn.t()
  @doc """
  Verify token and set user struct to assigns if applicable.

  Takes a list of tuples that correspond to fallback behavior
  """
  def auth_conn(conn, opts \\ []) do
    if bearer_token = get_session(conn, :user_bearer_token) do
      case verify_phx_token(bearer_token) do
        {:ok, [user_id: user_id, session_id: token_session]} ->
          case Db.Users.get_user_by(:uuid, user_id) do
            {:ok, %Db.User{token_serial: user_session} = user} ->
              if user_session == token_session do
                auth_user =
                  user
                  |> Utils.db_user_to_user()
                  |> Utils.server_to_client_user()

                conn
                |> assign(:auth_user, auth_user)
              else
                Logger.error("auth token session expired")
                auth_failure_fallback(conn, opts)
              end

            {:error, reason} ->
              Logger.error(reason)
          end

        {:error, reason} ->
          Logger.error(reason)
          auth_failure_fallback(conn, opts)
      end
    else
      auth_failure_fallback(conn, opts)
    end
  end

  defp auth_failure_fallback(conn, opts) do
    cond do
      Enum.member?(opts, :redirect_to_login) ->
        conn
        |> redirect(to: Routes.page_path(conn, :register_player, destination: conn.request_path))
        |> halt()

      Enum.member?(opts, :return_auth_error) ->
        auth_error(conn)

      true ->
        conn
    end
  end

  @spec has_bearer_token?(Plug.Conn.t()) :: boolean()
  def has_bearer_token?(conn) do
    conn.assigns[:user_bearer_token] != nil
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

  @spec has_user_session?(Plug.Conn.t()) :: boolean()
  def has_user_session?(conn) do
    !(conn.assigns[:auth_user] |> is_nil())
  end
end
