defmodule MidimatchesWeb.PageController do
  use MidimatchesWeb, :controller

  alias Midimatches.{
    BannedUsers,
    Pids,
    Rooms,
    Rooms.RoomServer
  }

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    if has_user_session?(conn) do
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

  @spec menu(Plug.Conn.t(), any) :: Plug.Conn.t()
  def menu(conn, _params) do
    if has_user_session?(conn) do
      success_behavior = fn conn -> render(conn, "menu.html") end
      redirect_if_banned(conn, success_behavior)
    else
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/menu")
      )
    end
  end

  @spec serverlist(Plug.Conn.t(), any) :: Plug.Conn.t()
  def serverlist(conn, _params) do
    if has_user_session?(conn) do
      success_behavior = fn conn -> render(conn, "serverlist.html") end

      redirect_if_banned(conn, success_behavior)
    else
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/rooms")
      )
    end
  end

  @spec room(Plug.Conn.t(), map) :: Plug.Conn.t()
  def room(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    if has_user_session?(conn) do
      success_behavior = fn conn ->
        if Rooms.room_exists?(room_id) do
          room_server = Pids.fetch!({:room_server, room_id})

          if RoomServer.full?(room_server) do
            render(conn, "full_room.html")
          else
            render(conn, "room.html")
          end
        else
          render(conn, "missing_room.html")
        end
      end

      redirect_if_banned(conn, success_behavior)
    else
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/room/#{room_id}")
      )
    end
  end

  @spec register_player(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Page containing user registration form. This prompt is encountered if the acting
  user does not have a player in their session cookie yet. The destination field ensures
  that after they register, they are resolved to the correct destination.
  """
  def register_player(conn, params) do
    destination =
      case params do
        %{"destination" => destination} -> destination
        _ -> "/menu"
      end

    if has_user_session?(conn) do
      success_behavior = fn conn ->
        render(conn, "register_player.html", destination: destination)
      end

      redirect_if_banned(conn, success_behavior)
    else
      render(conn, "register_player.html", destination: destination)
    end
  end

  @spec practice(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to page that renders a single player practice game mode.
  """
  def practice(conn, _params) do
    if has_user_session?(conn) do
      success_behavior = fn conn -> render(conn, "practice.html") end
      redirect_if_banned(conn, success_behavior)
    else
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/practice")
      )
    end
  end

  @spec redirect_if_banned(Plug.Conn.t(), (Plug.Conn.t() -> Plug.Conn.t())) :: Plug.Conn.t()
  defp redirect_if_banned(conn, success_behavior) do
    user_id = get_session(conn, :user).user_id

    if BannedUsers.banned?(user_id) do
      # # TODO implement a banned page and redirect to this
      # redirect(conn, to: Routes.page_path(conn, :about))
      render(conn, "banned.html")
    else
      success_behavior.(conn)
    end
  end

  @spec has_user_session?(Plug.Conn.t()) :: boolean()
  defp has_user_session?(conn) do
    !(conn |> get_session(:user) |> is_nil())
  end
end
