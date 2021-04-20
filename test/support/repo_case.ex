defmodule MidimatchesDb.RepoCase do
  @moduledoc false

  use ExUnit.CaseTemplate

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
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Repo, {:shared, self()})
    end

    :ok
  end
end
