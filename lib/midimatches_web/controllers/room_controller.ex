defmodule MidimatchesWeb.RoomController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias Midimatches.{
    ProfanityFilter,
    Rooms,
    Types.Configs.RoomConfig,
    Types.GameRules
  }

  require Logger

  @max_players 10
  @min_players 3
  @max_num_rounds 10
  @min_num_rounds 1
  @min_room_name_length 3
  @max_room_name_length 20

  @type id() :: String.t()

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
    if has_user_session?(conn) do
      user_id = get_session(conn, :user).user_id

      with {:ok, room_name} <- parse_room_name(room_name, user_id),
           {:ok, max_players} <- parse_max_players(max_players),
           {:ok, num_rounds} <- parse_num_rounds(num_rounds) do
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

        conn
        |> json(%{link_to_room: link_to_room})
      else
        {:error, reason} ->
          Logger.warn("create room failed with error reason #{reason}")

          conn
          |> put_status(:bad_request)
          |> json(%{error: reason})
      end
    else
      conn
      |> put_status(401)
      |> json(%{error: "no authorized user session"})
    end
  end

  @spec parse_room_name(String.t(), id()) :: {:error, String.t()} | {:ok, String.t()}
  defp parse_room_name(room_name, user_id) do
    with {:ok, room_name} <- validate_room_name_length(room_name),
         {:ok, room_name} <- validate_room_name_profanity(room_name, user_id) do
      {:ok, room_name}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp validate_room_name_length(room_name) do
    room_name_len = String.length(room_name)

    if room_name_len < @min_room_name_length or room_name_len > @max_room_name_length do
      {:error, invalid_value_error("room_name", :invalid_length)}
    else
      {:ok, room_name}
    end
  end

  defp validate_room_name_profanity(room_name, user_id) do
    if ProfanityFilter.contains_profanity?(room_name) do
      Logger.warn(
        "[PROFANITY_ALERT]: user_id=#{user_id} tried to create a room with room_name=#{room_name}"
      )

      {:error, invalid_value_error("room_name", :profanity)}
    else
      {:ok, room_name}
    end
  end

  @spec parse_max_players(integer()) :: {:error, String.t()} | {:ok, integer()}
  defp parse_max_players(max_players)
       when is_integer(max_players) and (max_players > @max_players or max_players < @min_players) do
    {:error, invalid_value_error("max_players", :out_of_valid_range)}
  end

  defp parse_max_players(max_players) when is_integer(max_players), do: {:ok, max_players}

  @spec parse_num_rounds(integer()) :: {:error, String.t()} | {:ok, integer()}
  defp parse_num_rounds(num_rounds)
       when is_integer(num_rounds) and
              (num_rounds > @max_num_rounds or num_rounds < @min_num_rounds) do
    {:error, invalid_value_error("num_rounds", :out_of_valid_range)}
  end

  defp parse_num_rounds(num_rounds), do: {:ok, num_rounds}
end
