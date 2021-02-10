defmodule Midimatches.Types.WinResult do
  @moduledoc false

  use TypedStruct

  @type id() :: String.t()

  @derive Jason.Encoder
  typedstruct enforce: true do
    field(:winners, list(id()))
    field(:num_points, number())
  end
end
