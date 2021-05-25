# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

# Configures the endpoint
config :midimatches, MidimatchesWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "61uuB1EEWOsdVnmjqxSetWbmTCghERuN+VKNVLRve3t8xSRnvZhcmc1+ElQ/rt5s",
  render_errors: [view: MidimatchesWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Midimatches.PubSub,
  live_view: [signing_salt: "p7k9h6tJ"]

# Configures custom application env vars
config :midimatches,
  custom_telemetrics: false,
  ecto_repos: [MidimatchesDb.Repo],
  rooms_config: "config/app_scheme/dev/config.json",
  token_secret: System.get_env("TOKEN_SECRET"),
  host_url: "https://midimatches.com"

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configure sendgrid mailer
config :sendgrid,
  api_key: {:system, "SENDGRID_API_KEY"}

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

config :ex_aws,
  json_codec: Jason,
  access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY")

config :ex_rated,
  timeout: 10_000,
  cleanup_rate: 10_000,
  persistent: false,
  name: :ex_rated,
  ets_table_name: :rate_limit_buckets
