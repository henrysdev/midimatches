defmodule Midimatches.Matchmaking do
  @moduledoc """
  Provides API for player-to-room matchmaking functionality
  """

  alias Midimatches.{
    Rooms,
    Types.ClientRoomState,
    Utils
  }

  @spec get_rooms_list() :: list(%ClientRoomState{})
  @doc """
  Returns a list of room states for currently active room servers
  """
  def get_rooms_list do
    get_rooms_pid_list()
    |> Stream.map(&:sys.get_state(&1))
    |> Enum.map(&Utils.server_to_client_room_state(&1))
  end

  @spec get_rooms_pid_list() :: list(%ClientRoomState{})
  @doc """
  Returns a list of room pids of currently active room severs
  """
  def get_rooms_pid_list do
    DynamicSupervisor.which_children(Rooms)
    |> Stream.map(fn {_, room_supervisor, _, _} -> room_supervisor end)
    |> Stream.map(&Supervisor.which_children(&1))
    |> Enum.map(fn [{_, room_server, _, _}] -> room_server end)
  end
end
