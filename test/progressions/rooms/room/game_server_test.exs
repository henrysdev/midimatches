defmodule Progressions.GameServerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.GameServer,
    Rooms.Room.GameServerAPI,
    TestHelpers,
    Types.Loop,
    Types.Musician
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "pregame lobby fills up and progresses to game start" do
    room_id = "1"
    musician_ids = ["musician1", "musician2", "musician3"]

    {:ok, game_server} = GameServer.start_link([room_id])

    {views, num_musicians} =
      Enum.reduce(
        musician_ids,
        {[], []},
        fn m_id, {views, num_musicians} ->
          %GameServer{musicians: curr_musicians} =
            GameServerAPI.add_musician(game_server, %Musician{
              musician_id: m_id
            })

          curr_view = GameServerAPI.get_current_view(game_server)
          curr_num_musicians = curr_musicians |> Map.keys() |> length()
          {[curr_view | views], [curr_num_musicians | num_musicians]}
        end
      )

    assert [:pregame_lobby, :pregame_lobby, :game_start] = Enum.reverse(views)
    assert [1, 2, 3] = Enum.reverse(num_musicians)
  end

  test "game start collects all ready ups and progresses to recording" do
    room_id = "1"
    musician_ids = ["musician1", "musician2", "musician3"]

    {:ok, game_server} = GameServer.start_link([room_id])

    game_server
    |> TestHelpers.add_musicians(musician_ids)

    {views, num_ready_ups} =
      Enum.reduce(
        musician_ids,
        {[], []},
        fn m_id, {views, num_ready_ups} ->
          %GameServer{ready_ups: curr_ready_ups} =
            GameServerAPI.musician_ready_up(game_server, m_id)

          curr_view = GameServerAPI.get_current_view(game_server)
          curr_num_ready_ups = curr_ready_ups |> Map.keys() |> length()
          {[curr_view | views], [curr_num_ready_ups | num_ready_ups]}
        end
      )

    assert [:game_start, :game_start, :recording] = Enum.reverse(views)
    assert [1, 2, 0] = Enum.reverse(num_ready_ups)
  end

  test "recording collects all recordings and progresses to playback voting" do
    room_id = "1"
    musician_ids = ["musician1", "musician2", "musician3"]

    {:ok, game_server} = GameServer.start_link([room_id])

    game_server
    |> TestHelpers.add_musicians(musician_ids)
    |> TestHelpers.ready_up_musicians(musician_ids)

    {views, num_recordings} =
      Enum.reduce(
        musician_ids,
        {[], []},
        fn m_id, {views, num_recordings} ->
          %GameServer{recordings: curr_recordings} =
            GameServerAPI.musician_recording(game_server, m_id, %Loop{
              start_timestep: 0,
              length: 4,
              timestep_slices: []
            })

          curr_view = GameServerAPI.get_current_view(game_server)
          curr_num_recordings = curr_recordings |> Map.keys() |> length()
          {[curr_view | views], [curr_num_recordings | num_recordings]}
        end
      )

    assert [:recording, :recording, :playback_voting] = Enum.reverse(views)
    assert [1, 2, 3] = Enum.reverse(num_recordings)
  end

  test "playback voting collects all votes and progresses to next round" do
    room_id = "1"
    musician_ids = ["musician1", "musician2", "musician3"]

    musician_votes = %{
      "musician1" => "musician2",
      "musician2" => "musician1",
      "musician3" => "musician1"
    }

    {:ok, game_server} = GameServer.start_link([room_id])

    game_server
    |> TestHelpers.add_musicians(musician_ids)
    |> TestHelpers.ready_up_musicians(musician_ids)
    |> TestHelpers.record_musicians(musician_ids)

    {views, num_votes, scores} =
      Enum.reduce(
        musician_ids,
        {[], [], []},
        fn m_id, {views, num_votes, scores} ->
          %GameServer{votes: curr_votes, scores: curr_scores} =
            GameServerAPI.musician_vote(game_server, m_id, Map.get(musician_votes, m_id))

          curr_view = GameServerAPI.get_current_view(game_server)
          curr_num_votes = curr_votes |> Map.keys() |> length()
          {[curr_view | views], [curr_num_votes | num_votes], [curr_scores | scores]}
        end
      )

    assert [:playback_voting, :playback_voting, :recording] = Enum.reverse(views)
    assert [1, 2, 0] = Enum.reverse(num_votes)
    assert [%{"musician1" => 0}, %{"musician1" => 0}, %{"musician1" => 1}] = Enum.reverse(scores)
  end

  test "playback voting collects all votes and progresses to game end" do
    room_id = "1"
    musician_ids = ["musician1", "musician2", "musician3"]

    musician_votes = %{
      "musician1" => "musician2",
      "musician2" => "musician1",
      "musician3" => "musician1"
    }

    {:ok, game_server} = GameServer.start_link([room_id])

    game_server
    |> TestHelpers.add_musicians(musician_ids)
    |> TestHelpers.ready_up_musicians(musician_ids)
    |> TestHelpers.record_musicians(musician_ids)
    |> TestHelpers.vote_for_musicians(musician_votes)
    |> TestHelpers.record_musicians(musician_ids)

    {views, num_votes, scores} =
      Enum.reduce(
        musician_ids,
        {[], [], []},
        fn m_id, {views, num_votes, scores} ->
          %GameServer{votes: curr_votes, scores: curr_scores} =
            GameServerAPI.musician_vote(game_server, m_id, Map.get(musician_votes, m_id))

          curr_view = GameServerAPI.get_current_view(game_server)
          curr_num_votes = curr_votes |> Map.keys() |> length()
          {[curr_view | views], [curr_num_votes | num_votes], [curr_scores | scores]}
        end
      )

    assert [:playback_voting, :playback_voting, :game_end] = Enum.reverse(views)
    assert [1, 2, 0] = Enum.reverse(num_votes)
    assert [%{"musician1" => 1}, %{"musician1" => 1}, %{"musician1" => 2}] = Enum.reverse(scores)
  end
end
