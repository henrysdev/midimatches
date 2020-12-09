defmodule ProgressionsWeb.PageController do
  use ProgressionsWeb, :controller

  alias Progressions.Rooms

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  @spec room(Plug.Conn.t(), map) :: Plug.Conn.t()
  def room(conn, %{"room_id" => room_id}) do
    if Rooms.room_exists?(room_id) do
      render(conn, "room.html")
    else
      render(conn, "not_found.html")
    end
  end
end
