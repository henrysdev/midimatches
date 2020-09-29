defmodule ProgressionsWeb.PageController do
  use ProgressionsWeb, :controller
  alias Progressions.{Rooms}

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def room(conn, %{"room_id" => _room_id}) do
    render(conn, "index.html")
  end

  def debug_create_room(conn, %{"room_id" => room_id}) do
    # TODO DEBUG REMOVE
    {:ok, _} = Rooms.add_room(room_id)
    render(conn, "index.html")
  end
end
