defmodule MidimatchesDb.GameRecord do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  schema "game_record" do
    field(:game_end_reason, Ecto.Enum, values: [:completed, :canceled])
    field(:game_start_time, :utc_datetime_usec)
    field(:game_end_time, :utc_datetime_usec)

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:game_end_reason, :game_start_time, :game_end_time])
    |> validate_required([:game_end_reason])
  end
end
