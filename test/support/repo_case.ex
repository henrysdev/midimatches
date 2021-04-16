defmodule MidimatchesDb.RepoCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      alias MidimatchesDb.Repo

      import Ecto
      import Ecto.Query
      import MidimatchesDb.RepoCase
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(MidimatchesDb.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(MidimatchesDb.Repo, {:shared, self()})
    end

    :ok
  end
end
