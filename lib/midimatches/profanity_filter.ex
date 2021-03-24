defmodule Midimatches.ProfanityFilter do
  @moduledoc """
  Provides API for checking user generated strings for profanity
  """
  @profanity_config Expletive.configure(blacklist: Expletive.Blacklist.english())

  @spec contains_profanity?(String.t()) :: boolean()
  @doc """
  Returns truthy for if the give text contains a blacklisted word
  """
  def contains_profanity?(text) do
    Expletive.profane?(text, @profanity_config)
  end

  @spec sanitize(String.t()) :: String.t()
  @doc """
  Sanitize user input string with astericks
  """
  def sanitize(text) do
    Expletive.sanitize(text, @profanity_config, {:keep_first_letter, "*"})
  end
end
