defmodule Midimatches.ProfanityFilterTest do
  use ExUnit.Case
  use MidimatchesWeb.ChannelCase

  alias Midimatches.ProfanityFilter

  describe "bad word check" do
    test "detects a bad word" do
      assert ProfanityFilter.contains_profanity?("fuck")
    end

    test "detects a bad word in a sentence" do
      assert ProfanityFilter.contains_profanity?("what the fuck, man?")
    end

    test "does not detect a good word" do
      assert !ProfanityFilter.contains_profanity?("shoe")
    end
  end

  describe "sanitizes" do
    test "bad words in a sentence" do
      bad_text = "what the fucking fuck?"
      sanitized_text = ProfanityFilter.sanitize(bad_text)
      expected_text = "what the f****** f***?"
      assert sanitized_text == expected_text
    end

    test "nothing in a sentence with no bad words" do
      bad_text = "what the ducking duck?"
      sanitized_text = ProfanityFilter.sanitize(bad_text)
      expected_text = bad_text
      assert sanitized_text == expected_text
    end
  end
end
