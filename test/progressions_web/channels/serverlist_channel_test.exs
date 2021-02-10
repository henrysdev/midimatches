defmodule MidimatchesWeb.ServerlistChannelTest do
  use MidimatchesWeb.ChannelCase, async: true

  alias MidimatchesWeb.{
    ServerlistChannel,
    UserSocket
  }

  alias Midimatches.TestHelpers

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)

    {:ok, _, socket} =
      UserSocket
      |> socket()
      |> subscribe_and_join(ServerlistChannel, "landing_page:serverlist")

    %{socket: socket}
  end

  # test "client joins serverlist successfully", %{socket: socket} do
  #   {:ok, _, _} =
  #     socket
  #     |> subscribe_and_join(ServerlistChannel, "servers:serverlist")

  #   assert_push("serverlist_update", %{
  #     rooms: [
  #       %Midimatches.Types.ClientRoomState{
  #         game_rules: %Midimatches.Types.GameRules{
  #           game_size_num_players: 4,
  #           quantization_threshold: 0.5,
  #           rounds_to_win: 3,
  #           solo_time_limit: 30,
  #           timestep_size: 50,
  #           view_timeouts: %Midimatches.Types.GameRules.ViewTimeouts{
  #             game_end: 5000,
  #             game_start: 20000,
  #             playback_voting: 90000,
  #             recording: 50000,
  #             round_end: 3000,
  #             round_start: 3000
  #           }
  #         },
  #         num_curr_players: 0,
  #         room_id: "1",
  #         room_name: "foo"
  #       }
  #     ]
  #   })
  # end
end
