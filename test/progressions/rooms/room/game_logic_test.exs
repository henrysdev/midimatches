defmodule Midimatches.GameLogicTest do
  use ExUnit.Case

  alias Midimatches.{
    Rooms.Room.GameLogic,
    Rooms.Room.GameServer,
    TestHelpers,
    Types.Player
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  describe "ready up" do
    test "all musicians and advance to next game view" do
      players =
        MapSet.new([
          %Player{
            musician_id: "1",
            player_alias: "foo"
          },
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ])

      musicians = MapSet.new(["1", "2", "3", "4"])

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        musicians: musicians,
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          musicians,
          {game_server_state, []},
          fn musician, {gss, state_scan} ->
            %{state: gss} = GameLogic.ready_up(gss, musician)
            ready_ups = MapSet.to_list(gss.ready_ups)
            {gss, [{ready_ups, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {["1"], :game_start},
        {["1", "2"], :game_start},
        {["1", "2", "3"], :game_start},
        {["1", "2", "3", "4"], :round_start}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end

    test "handles duplicate ready up case" do
      players =
        MapSet.new([
          %Player{
            musician_id: "1",
            player_alias: "foo"
          },
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ])

      musicians = MapSet.new(["1", "2", "3", "4"])
      duped_ready_ups = ["1", "1", "3", "1"]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        musicians: musicians,
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          duped_ready_ups,
          {game_server_state, []},
          fn musician, {gss, state_scan} ->
            %{state: gss} = GameLogic.ready_up(gss, musician)
            ready_ups = MapSet.to_list(gss.ready_ups)
            {gss, [{ready_ups, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {["1"], :game_start},
        {["1"], :game_start},
        {["1", "3"], :game_start},
        {["1", "3"], :game_start}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end
  end

  describe "recordings" do
    test "are submitted from all contestants and game view advances" do
      players =
        MapSet.new([
          %Player{
            musician_id: "1",
            player_alias: "foo"
          },
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ])

      musicians = MapSet.new(["1", "2", "3", "4"])
      event_payloads = [{"1", %{"a" => "foo"}}, {"2", %{"b" => "bar"}}]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        musicians: musicians,
        game_view: :recording,
        contestants: ["1", "2"],
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            %{state: gss} = GameLogic.add_recording(gss, ep)
            recordings = Map.values(gss.recordings)
            {gss, [{recordings, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {[%{"a" => "foo"}], :recording},
        {[%{"a" => "foo"}, %{"b" => "bar"}], :playback_voting}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end
  end

  describe "cast votes" do
    test "are submitted from all judges and game view advances" do
      players =
        MapSet.new([
          %Player{
            musician_id: "1",
            player_alias: "foo"
          },
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ])

      contestants = ["1", "2", "3", "4"]
      musicians = MapSet.new(contestants)
      event_payloads = [{"3", "1"}, {"4", "1"}, {"2", "1"}, {"1", "4"}]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        musicians: musicians,
        game_view: :playback_voting,
        contestants: ["1", "2", "3", "4"],
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            %{state: gss} = GameLogic.cast_vote(gss, ep)

            {gss, [{gss.votes, gss.game_winners, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1", "4" => "1"}, nil, :playback_voting},
        {%{"2" => "1", "3" => "1", "4" => "1"}, nil, :playback_voting},
        {%{"1" => "4", "2" => "1", "3" => "1", "4" => "1"}, nil, :round_end}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end

    test "have invalid votes that are not counted" do
      players =
        MapSet.new([
          %Player{
            musician_id: "1",
            player_alias: "foo"
          },
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ])

      contestants = ["1", "2", "3", "4"]
      musicians = MapSet.new(contestants)

      event_payloads = [
        {"3", "1"},
        {"3", "1"},
        {"1", "3"},
        {"3", "2"},
        {"0", "1"},
        {"4", "1"},
        {"2", "1"}
      ]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        musicians: musicians,
        game_view: :playback_voting,
        contestants: contestants,
        round_num: 3,
        game_rules: %{rounds_to_win: 3},
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            %{state: gss} = GameLogic.cast_vote(gss, ep)

            {gss, [{gss.votes, gss.game_winners, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1", "1" => "3"}, nil, :playback_voting},
        {%{"3" => "1", "1" => "3"}, nil, :playback_voting},
        {%{"3" => "1", "1" => "3"}, nil, :playback_voting},
        {%{"3" => "1", "1" => "3", "4" => "1"}, nil, :playback_voting},
        {%{"1" => "3", "3" => "1", "4" => "1", "2" => "1"}, nil, :round_end}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end
  end

  test "remove musician from game" do
    players =
      MapSet.new([
        %Player{
          musician_id: "1",
          player_alias: "foo"
        },
        %Player{
          musician_id: "2",
          player_alias: "zoo"
        },
        %Player{
          musician_id: "3",
          player_alias: "fee"
        },
        %Player{
          musician_id: "4",
          player_alias: "fum"
        }
      ])

    contestants = ["1", "2", "3", "4"]
    musicians = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      musicians: musicians,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    %{state: actual_state} = GameLogic.remove_musician(game_server_state, "1")

    expected_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players:
        MapSet.new([
          %Player{
            musician_id: "2",
            player_alias: "zoo"
          },
          %Player{
            musician_id: "3",
            player_alias: "fee"
          },
          %Player{
            musician_id: "4",
            player_alias: "fum"
          }
        ]),
      musicians: MapSet.new(["2", "3", "4"]),
      game_view: :playback_voting,
      contestants: ["2", "3", "4"],
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    assert actual_state == expected_state
  end
end
