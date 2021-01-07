defmodule Progressions.NewGameLogicTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.NewGameLogic,
    Rooms.Room.NewGameServer,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  describe "ready up" do
    test "all musicians and advance to next game view" do
      musicians = ["1", "2", "3", "4"]

      game_server_state = %NewGameServer{
        musicians: MapSet.new(musicians)
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          musicians,
          {game_server_state, []},
          fn musician, {gss, state_scan} ->
            gss = NewGameLogic.ready_up(gss, musician)
            ready_ups = MapSet.to_list(gss.ready_ups)
            {gss, [{ready_ups, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {["1"], :game_start},
        {["1", "2"], :game_start},
        {["1", "2", "3"], :game_start},
        {["1", "2", "3", "4"], :recording}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end

    test "handles duplicate ready up case" do
      musicians = ["1", "2", "3", "4"]
      duped_ready_ups = ["1", "1", "3", "1"]

      game_server_state = %NewGameServer{
        musicians: MapSet.new(musicians)
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          duped_ready_ups,
          {game_server_state, []},
          fn musician, {gss, state_scan} ->
            gss = NewGameLogic.ready_up(gss, musician)
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
      musicians = ["1", "2", "3", "4"]
      event_payloads = [{"1", %{"a" => "foo"}}, {"2", %{"b" => "bar"}}]

      game_server_state = %NewGameServer{
        musicians: MapSet.new(musicians),
        game_view: :recording,
        contestants: ["1", "2"]
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            gss = NewGameLogic.add_recording(gss, ep)
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
      contestants = ["1", "2"]
      judges = ["3", "4"]
      musicians = contestants ++ judges
      event_payloads = [{"3", "1"}, {"4", "1"}]

      game_server_state = %NewGameServer{
        musicians: MapSet.new(musicians),
        game_view: :playback_voting,
        contestants: ["1", "2"],
        judges: ["3", "4"]
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            gss = NewGameLogic.cast_vote(gss, ep)
            {gss, [{gss.votes, gss.winner, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1", "4" => "1"}, {"1", 2}, :game_start}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end

    test "have invalid votes that are not counted" do
      contestants = ["1", "2"]
      judges = ["3", "4"]
      musicians = contestants ++ judges
      event_payloads = [{"3", "1"}, {"3", "1"}, {"1", "3"}, {"3", "2"}, {"0", "1"}, {"4", "1"}]

      game_server_state = %NewGameServer{
        musicians: MapSet.new(musicians),
        game_view: :playback_voting,
        contestants: contestants,
        judges: judges
      }

      {_bracket, actual_state_scan} =
        Enum.reduce(
          event_payloads,
          {game_server_state, []},
          fn ep, {gss, state_scan} ->
            gss = NewGameLogic.cast_vote(gss, ep)
            {gss, [{gss.votes, gss.winner, gss.game_view} | state_scan]}
          end
        )

      expected_state_scan = [
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1"}, nil, :playback_voting},
        {%{"3" => "1", "4" => "1"}, {"1", 2}, :game_start}
      ]

      assert Enum.reverse(actual_state_scan) == expected_state_scan
    end
  end
end
