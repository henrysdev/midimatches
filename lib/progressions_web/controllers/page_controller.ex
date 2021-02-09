defmodule ProgressionsWeb.PageController do
  use ProgressionsWeb, :controller

  alias Progressions.Rooms

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  @spec room(Plug.Conn.t(), map) :: Plug.Conn.t()
  def room(%Plug.Conn{} = conn, %{"room_id" => room_id}) do
    cond do
      is_nil(get_session(conn, :user)) ->
        redirect(conn,
          to: Routes.page_path(conn, :register_player, destination: "/room/#{room_id}")
        )

      Rooms.room_exists?(room_id) ->
        render(conn, "room.html")

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

  def register_player(conn, _params) do
    render(conn, "register_player.html", destination: "/")
  end
end
