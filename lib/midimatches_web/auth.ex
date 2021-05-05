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

    put_session(conn, :user_bearer_token, token)
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
            {:ok, %Db.User{token_serial: user_session, registered: registered?} = user} ->
              if :registered_only not in opts or (:registered_only in opts and registered?) do
                if user_session == token_session do
                  auth_user =
                    user
                    |> Utils.db_user_to_user()
                    |> Utils.server_to_client_user()

                  conn
                  |> assign(:auth_user, auth_user)
                else
                  reason = "auth token session no longer valid"
                  auth_failure_fallback(conn, opts, reason)
                end
              else
                reason = "auth token for a user with insufficient access level"
                auth_failure_fallback(conn, opts, reason)
              end

            {:error, reason} ->
              auth_failure_fallback(conn, opts, reason)
          end

        {:error, reason} ->
          auth_failure_fallback(conn, opts, reason)
      end
    else
      auth_failure_fallback(conn, opts)
    end
  end

  defp auth_failure_fallback(conn, opts, reason \\ nil) do
    if is_nil(reason) do
      :ok
    else
      Logger.error(reason)
    end

    cond do
      :redirect_to_login in opts ->
        conn
        |> redirect(to: Routes.page_path(conn, :register_player, destination: conn.request_path))
        |> halt()

      :return_auth_error in opts ->
        auth_error(conn)

      true ->
        conn
    end
  end

  @spec has_bearer_token?(Plug.Conn.t()) :: boolean()
  def has_bearer_token?(conn) do
    conn.assigns[:user_bearer_token] != nil
  end

  def verify_phx_token(token) do
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
