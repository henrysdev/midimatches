defmodule Midimatches.Repo do
  use Ecto.Repo,
    otp_app: :midimatches,
    adapter: Ecto.Adapters.Postgres
end
