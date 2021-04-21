defmodule MidimatchesDb.RepoCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  alias Ecto.Adapters.SQL.Sandbox
  alias MidimatchesDb.Repo

  using do
    quote do
      alias MidimatchesDb.Repo

      import Ecto
      import Ecto.Query
      import MidimatchesDb.RepoCase
    end
  end

  setup tags do
    :ok = Sandbox.checkout(Repo)

    unless tags[:async] do
      Sandbox.mode(Repo, {:shared, self()})
    end

    :ok
  end
end
