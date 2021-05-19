defmodule MidimatchesWeb.PageController do
  use MidimatchesWeb, :controller

  alias Midimatches.{
    BannedUsers,
    Pids,
    Rooms,
    Rooms.RoomServer
  }

  alias MidimatchesWeb.Auth

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    if Auth.has_user_session?(conn) do
      success_behavior = fn conn ->
        redirect(conn,
          to: Routes.page_path(conn, :menu)
        )
      end

      redirect_if_banned(conn, success_behavior)
    else
      redirect(conn,
        to: Routes.page_path(conn, :about)
      )
    end
  end

  @spec about(Plug.Conn.t(), any) :: Plug.Conn.t()
  def about(conn, _params) do
    render(conn, "about.html")
  end

  @spec privacy(Plug.Conn.t(), any) :: Plug.Conn.t()
  def privacy(conn, _params) do
    render(conn, "privacy.html")
  end

  @spec terms(Plug.Conn.t(), any) :: Plug.Conn.t()
  def terms(conn, _params) do
    render(conn, "terms.html")
  end

  @spec menu(Plug.Conn.t(), any) :: Plug.Conn.t()
  def menu(conn, _params) do
    redirect_if_banned(conn, fn conn -> render(conn, "menu.html") end)
  end

  @spec serverlist(Plug.Conn.t(), any) :: Plug.Conn.t()
  def serverlist(conn, _params) do
    redirect_if_banned(conn, fn conn -> render(conn, "serverlist.html") end)
  end

  @spec room_play(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Shortcut route to join player into game as a participatory musician/player.
  """
  def room_play(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    redirect(conn, to: Routes.page_path(conn, :room, room_id, audience: false))
  end

  @spec room_watch(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Shortcut route to join player into game as an audience member.
  """
  def room_watch(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    redirect(conn, to: Routes.page_path(conn, :room, room_id, audience: true))
  end

  @spec room(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Page that hosts all in-game UI content. Handles players as well as audience members.
  """
  def room(%Plug.Conn{} = conn, %{"room_id" => room_id, "audience" => "true"}) do
    room_page(conn, room_id, :audience_member)
  end

  def room(%Plug.Conn{} = conn, %{"room_id" => room_id, "audience" => "false"}) do
    room_page(conn, room_id, :player)
  end

  def room(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    room_page(conn, room_id, :not_specified)
  end

  defp room_page(%Plug.Conn{} = conn, room_id, player_role) do
    success_behavior = fn conn ->
      if Rooms.room_exists?(room_id) do
        room_server = Pids.fetch!({:room_server, room_id})

        if RoomServer.full?(room_server) and player_role == :player do
          render(conn, "full_room.html", room_id: room_id)
        else
          render(conn, "room.html", player_role: player_role)
        end
      else
        render(conn, "missing_room.html")
      end
    end

    redirect_if_banned(conn, success_behavior)
  end

  @spec enter_player(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Page containing user registration form. This prompt is encountered if the acting
  user does not have a player in their session cookie yet. The destination field ensures
  that after they register, they are resolved to the correct destination.
  """
  def enter_player(conn, params) do
    destination =
      case params do
        %{"destination" => destination} -> destination
        _ -> "/menu"
      end

    if Auth.has_user_session?(conn) do
      success_behavior = fn conn ->
        if Auth.has_registered_user_session?(conn) do
          redirect(conn, to: Routes.page_path(conn, :account))
        else
          render(conn, "enter_player.html", destination: destination)
        end
      end

      redirect_if_banned(conn, success_behavior)
    else
      render(conn, "enter_player.html", destination: destination)
    end
  end

  @spec practice(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to page that renders a single player practice game mode.
  """
  def practice(conn, _params) do
    success_behavior = fn conn -> render(conn, "practice.html") end
    redirect_if_banned(conn, success_behavior)
  end

  @spec account(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to account page
  """
  def account(conn, _params) do
    success_behavior = fn conn -> render(conn, "account.html") end
    redirect_if_banned(conn, success_behavior)
  end

  @spec recover_account(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to page where a user can attempt to recover their account via password reset
  """
  def recover_account(conn, _params) do
    success_behavior = fn conn -> render(conn, "recover_account.html") end
    redirect_if_banned(conn, success_behavior)
  end

  @spec reset_password(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to page where a user can reset their password
  """
  def reset_password(conn, %{"reset_token" => reset_token}) do
    case Auth.parse_reset_token(reset_token) do
      {:ok, %{"user_id" => user_id}} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> render("password_reset.html")

      {:error, _} ->
        render(conn, "invalid_password_reset.html")
    end
  end

  # TODO move to plug
  @spec redirect_if_banned(Plug.Conn.t(), (Plug.Conn.t() -> Plug.Conn.t())) :: Plug.Conn.t()
  defp redirect_if_banned(conn, success_behavior) do
    if user = conn.assigns[:auth_user] do
      if BannedUsers.banned?(user.user_id) do
        # # TODO implement a banned page and redirect to this
        # redirect(conn, to: Routes.page_path(conn, :about))
        render(conn, "banned.html")
      else
        success_behavior.(conn)
      end
    else
      success_behavior.(conn)
    end
  end
end
