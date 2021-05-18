defmodule MidimatchesDb.PlayerOutcomes do
  @moduledoc """
  DB boundary for PlayerOutcome objects
  """

  alias MidimatchesDb.{
    PlayerOutcome,
    Repo
  }

  @spec create_player_outcome(%PlayerOutcome{}) :: %PlayerOutcome{}
  @doc """
  Insert a new player outcome
  """
  def create_player_outcome(%PlayerOutcome{} = player_outcome) do
    Repo.insert(player_outcome)
  end

  @spec bulk_create_player_outcomes(list(%PlayerOutcome{})) :: :ok | {:error, any()}
  @doc """
  Insert multiple player outcomes
  """
  def bulk_create_player_outcomes(player_outcomes) when is_list(player_outcomes) do
    if length(player_outcomes) > 0 do
      errors =
        player_outcomes
        |> Stream.map(&create_player_outcome/1)
        |> Enum.reduce([], fn response, acc ->
          case response do
            {:error, reason} -> [reason | acc]
            _ -> acc
          end
        end)

      if length(errors) > 0 do
        {:error, errors}
      else
        :ok
      end
    else
      :ok
    end
  end
end
