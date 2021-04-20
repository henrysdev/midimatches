defmodule MidimatchesDb.BackingTracksTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    BackingTrack,
    BackingTracks
  }

  alias Midimatches.TestHelpers

  test "create backing track" do
    backing_track = %BackingTrack{
      name: "jazzy",
      file_url: "https://jazzzzziness/jazzy.com",
      bpm: 90,
      musical_key: "Em",
      author: "mr funkadelic"
    }

    inserted_track = BackingTracks.create_backing_track(backing_track)

    expected_track = %BackingTrack{
      name: "jazzy",
      file_url: "https://jazzzzziness/jazzy.com",
      bpm: 90,
      musical_key: "Em",
      author: "mr funkadelic"
    }

    assertion_fields = [:author, :bpm, :file_url, :musical_key, :name]

    Enum.each(assertion_fields, fn field ->
      assert Map.get(inserted_track, field) == Map.get(expected_track, field)
    end)
  end

  describe "fetch random backing tracks" do
    test "for specified count" do
      TestHelpers.populate_backing_tracks_table(10)

      fetched_tracks = BackingTracks.fetch_random_backing_tracks(4)

      assert length(fetched_tracks) == 4
    end

    test "when count is greater than number of total tracks should return all tracks" do
      TestHelpers.populate_backing_tracks_table(10)

      fetched_tracks = BackingTracks.fetch_random_backing_tracks(40)

      assert length(fetched_tracks) == 10
    end
  end
end
