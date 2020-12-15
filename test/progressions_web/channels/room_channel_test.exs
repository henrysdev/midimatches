defmodule ProgressionsWeb.RoomChannelTest do
  use ProgressionsWeb.ChannelCase, async: true

  alias ProgressionsWeb.{
    RoomChannel,
    UserSocket
  }

  alias Progressions.{
    Pids,
    Rooms,
    Rooms.Room.GameServer,
    TestHelpers,
    Types.Loop
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    Rooms.add_room("1")

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(RoomChannel, "room:1")
      |> enter_room()

    %{socket: socket}
  end

  test "client joins existing room successfully", %{socket: socket} do
    {:ok, _, _} =
      socket
      |> subscribe_and_join(RoomChannel, "room:1")
      |> enter_room()

    {_view, %GameServer{musicians: musicians_in_room}} =
      {:game_server, "1"}
      |> Pids.fetch!()
      |> :sys.get_state()

    expected_num_musicians =
      musicians_in_room
      |> Map.keys()
      |> length()

    assert expected_num_musicians == 2
  end

  test "client gets error when non existent room joined", %{socket: socket} do
    assert {:error, _} = RoomChannel.join("room:3", %{}, socket)
  end

  test "client musician enter room", %{socket: socket} do
    push(socket, "musician_enter_room", %{})

    assert_broadcast("view_update", %{})
    assert_push("view_update", %{})
  end

  test "client musician leave room", %{socket: socket} do
    push(socket, "musician_leave_room", %{})

    assert_broadcast("view_update", %{})
    assert_push("view_update", %{})
  end

  test "client musician ready up", %{socket: socket} do
    push(socket, "musician_ready_up", %{})

    assert_broadcast("view_update", %{})
    assert_push("view_update", %{})
  end

  test "client musician recording", %{socket: socket} do
    push(socket, "musician_recording", %{
      "recording" => %Loop{
        start_timestep: 0,
        length: 4,
        timestep_slices: []
      }
    })

    assert_broadcast("view_update", %{})
    assert_push("view_update", %{})
  end

  test "client musician vote", %{socket: socket} do
    push(socket, "musician_vote", %{
      "vote" => "fakeMusicianId"
    })

    assert_broadcast("view_update", %{})
    assert_push("view_update", %{})
  end

  defp enter_room({:ok, params, socket}) do
    push(socket, "musician_enter_room", %{})
    {:ok, params, socket}
  end

  # TODO fix test assertions...
  # test "client musician ready up and receives state update", %{socket: socket} do
  #   room_topic = "room:1"
  #   musician_ids = ["musician1", "musician2"]
  #   acting_musician_id = Map.get(socket.assigns, :musician_id)

  #   expected_payload = %{
  #     ready_ups: %{
  #       acting_musician_id => true
  #     }
  #   }

  #   game_server =
  #     {:game_server, "1"}
  #     |> Pids.fetch!()

  #   game_server |> TestHelpers.add_musicians(musician_ids)

  #   1..3
  #   |> Enum.to_list()
  #   |> Enum.each(fn _ ->
  #     assert_broadcast(_, _)
  #     assert_push(_, _)
  #   end)

  #   ProgressionsWeb.Endpoint.subscribe(room_topic)

  #   push(socket, "musician_ready_up", %{})

  #   assert_receive expected_payload
  #   ProgressionsWeb.Endpoint.unsubscribe(room_topic)
  # end
end
