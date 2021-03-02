defmodule MidimatchesWeb.RoomController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.{
    Rooms,
    Types.Configs.RoomConfig,
    Types.GameRules
  }

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Create a new room
  """
  def create(
        conn,
        %{
          "room_name" => room_name,
          "max_players" => max_players,
          "num_rounds" => num_rounds
        }
      ) do
    room_config = %RoomConfig{
      room_name: room_name,
      server: %GameRules{
        max_players: max_players,
        rounds_to_win: num_rounds
      }
    }

    room_id = Rooms.configure_room(room_config)

    # TODO persist room
    link_to_room = Routes.page_path(conn, :room, room_id)
    created_room = room_config

    conn
    |> json(%{
      room: created_room,
      link_to_room: link_to_room
    })
  end
end
