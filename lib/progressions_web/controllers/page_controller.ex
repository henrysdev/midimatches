defmodule ProgressionsWeb.PageController do
  use ProgressionsWeb, :controller
  alias Progressions.{RoomsDynamicSupervisor}

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def room(conn, %{"room_id" => room_id}) do
    # TODO DEBUG REMOVE
    {:ok, _} = RoomsDynamicSupervisor.add_room(room_id)
    render(conn, "index.html")
  end
end
