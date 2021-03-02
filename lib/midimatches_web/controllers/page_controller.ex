defmodule MidimatchesWeb.PageController do
  use MidimatchesWeb, :controller

  alias Midimatches.{
    Pids,
    Rooms,
    Rooms.RoomServer,
    Utils
  }

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  @spec menu(Plug.Conn.t(), any) :: Plug.Conn.t()
  def menu(conn, _params) do
    if conn |> get_session(:user) |> is_nil() do
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/menu")
      )
    else
      render(conn, "menu.html")
    end
  end

  @spec serverlist(Plug.Conn.t(), any) :: Plug.Conn.t()
  def serverlist(conn, _params) do
    if conn |> get_session(:user) |> is_nil() do
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/servers")
      )
    else
      render(conn, "serverlist.html")
    end
  end

  @spec room(Plug.Conn.t(), map) :: Plug.Conn.t()
  def room(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    cond do
      conn |> get_session(:user) |> is_nil() ->
        redirect(conn,
          to: Routes.page_path(conn, :register_player, destination: "/room/#{room_id}")
        )

      Rooms.room_exists?(room_id) ->
        room_server = Pids.fetch!({:room_server, room_id})

        if RoomServer.full?(room_server) do
          render(conn, "full_room.html")
        else
          render(conn, "room.html")
        end

      true ->
        render(conn, "missing_room.html")
    end
  end

  @spec register_player(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Page containing user registration form. This prompt is encountered if the acting
  user does not have a player in their session cookie yet. The destination field ensures
  that after they register, they are resolved to the correct destination.
  """
  def register_player(conn, %{"destination" => destination}) do
    render(conn, "register_player.html", destination: destination)
  end

  def register_player(conn, %{"user_alias" => user_alias, "url_destination" => url_destination}) do
    conn =
      if is_nil(get_session(conn, :user)) do
        new_user = %{user_alias: user_alias, user_id: Utils.gen_uuid()}
        put_session(conn, :user, new_user)
      else
        existing_user = get_session(conn, :user)
        put_session(conn, :user, %{existing_user | user_alias: user_alias})
      end

    case url_destination do
      "/room/" <> room_id ->
        redirect(conn,
          to: Routes.page_path(conn, :room, room_id)
        )

      "/servers" ->
        redirect(conn,
          to: Routes.page_path(conn, :serverlist)
        )

      "/practice" ->
        redirect(conn,
          to: Routes.page_path(conn, :practice)
        )

      _ ->
        redirect(conn,
          to: Routes.page_path(conn, :menu)
        )
    end
  end

  def register_player(conn, _params) do
    render(conn, "register_player.html", destination: "/menu")
  end

  @spec practice(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Routes to page that renders a single player practice game mode.
  """
  def practice(conn, _params) do
    if conn |> get_session(:user) |> is_nil() do
      redirect(conn,
        to: Routes.page_path(conn, :register_player, destination: "/practice")
      )
    else
      render(conn, "practice.html")
    end
  end
end
