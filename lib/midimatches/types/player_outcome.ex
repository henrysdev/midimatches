defmodule Midimatches.Types.PlayerOutcome do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()
  @type event_type() :: :round | :game
  @type outcome() :: :won | :tied | :lost

  typedstruct do
    field(:player_id, id(), enforce: true)
    field(:event_type, event_type(), enforce: true)
    field(:outcome, outcome(), enforce: true)
    field(:num_points, integer(), default: 0)
  end
end
