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
    test "all players and advance to next game view" do
      players =
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      player_ids_set = MapSet.new(["1", "2", "3", "4"])

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
        sample_beats: []
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          player_ids_set,
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
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      player_ids_set = MapSet.new(["1", "2", "3", "4"])
      duped_ready_ups = ["1", "1", "3", "1"]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
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
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      player_ids_set = MapSet.new(["1", "2", "3", "4"])
      event_payloads = [{"1", %{"a" => "foo"}}, {"2", %{"b" => "bar"}}]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
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
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      contestants = ["1", "2", "3", "4"]
      player_ids_set = MapSet.new(contestants)
      event_payloads = [{"3", "1"}, {"4", "1"}, {"2", "1"}, {"1", "4"}]

      game_server_state = %GameServer{
        room_id: "1",
        game_id: "abc",
        players: players,
        player_ids_set: player_ids_set,
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
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ])

      contestants = ["1", "2", "3", "4"]
      player_ids_set = MapSet.new(contestants)

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
        player_ids_set: player_ids_set,
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

  test "remove player from game" do
    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        },
        %Player{
          player_id: "4",
          player_alias: "fum"
        }
      ])

    contestants = ["1", "2", "3", "4"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    %{state: actual_state} = GameLogic.remove_player(game_server_state, "1")

    expected_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players:
        MapSet.new([
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ]),
      player_ids_set: MapSet.new(["2", "3", "4"]),
      game_view: :playback_voting,
      contestants: ["2", "3", "4"],
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    assert actual_state == expected_state
  end

  test "add player to game" do
    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        }
      ])

    new_player = %Player{
      player_id: "4",
      player_alias: "fum"
    }

    contestants = ["1", "2", "3"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    %{state: actual_state} = GameLogic.add_player(game_server_state, new_player)

    expected_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players:
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          },
          %Player{
            player_id: "4",
            player_alias: "fum"
          }
        ]),
      player_ids_set: MapSet.new(["1", "2", "3", "4"]),
      game_view: :playback_voting,
      contestants: ["1", "2", "3", "4"],
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: [],
      scores: %{"4" => 0},
      ready_ups: MapSet.new(["4"])
    }

    assert actual_state == expected_state
  end

  test "add audience member to game" do
    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        },
        %Player{
          player_id: "3",
          player_alias: "fee"
        }
      ])

    new_audience_member = %Player{
      player_id: "4",
      player_alias: "fum"
    }

    contestants = ["1", "2", "3"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players: players,
      player_ids_set: player_ids_set,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    %{state: actual_state} = GameLogic.add_audience_member(game_server_state, new_audience_member)

    expected_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players:
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          },
          %Player{
            player_id: "3",
            player_alias: "fee"
          }
        ]),
      player_ids_set: MapSet.new(["1", "2", "3"]),
      audience_members: MapSet.new([%Player{player_id: "4", player_alias: "fum"}]),
      audience_member_ids_set: MapSet.new(["4"]),
      game_view: :playback_voting,
      contestants: ["1", "2", "3"],
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: [],
      scores: %{}
    }

    assert actual_state == expected_state
  end

  test "remove audience member from game" do
    players =
      MapSet.new([
        %Player{
          player_id: "1",
          player_alias: "foo"
        },
        %Player{
          player_id: "2",
          player_alias: "zoo"
        }
      ])

    audience_members =
      MapSet.new([
        %Player{
          player_id: "5",
          player_alias: "dum"
        }
      ])

    contestants = ["1", "2"]
    player_ids_set = MapSet.new(contestants)

    game_server_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      audience_members: audience_members,
      audience_member_ids_set: MapSet.new(["5"]),
      players: players,
      player_ids_set: player_ids_set,
      game_view: :playback_voting,
      contestants: contestants,
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    %{state: actual_state} = GameLogic.remove_audience_member(game_server_state, "5")

    expected_state = %GameServer{
      room_id: "1",
      game_id: "abc",
      players:
        MapSet.new([
          %Player{
            player_id: "1",
            player_alias: "foo"
          },
          %Player{
            player_id: "2",
            player_alias: "zoo"
          }
        ]),
      audience_members: MapSet.new(),
      audience_member_ids_set: MapSet.new(),
      player_ids_set: MapSet.new(["1", "2"]),
      game_view: :playback_voting,
      contestants: ["1", "2"],
      round_num: 3,
      game_rules: %{rounds_to_win: 3},
      sample_beats: []
    }

    assert actual_state == expected_state
  end
end
