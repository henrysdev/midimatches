use Mix.Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :midimatches, MidimatchesDb.Repo,
  username: "postgres",
  password: "postgres",
  database: "midimatches_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :midimatches, MidimatchesWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
# config :logger, level: :warn
config :logger,
  level: :warn,
  backends: [:console, {LoggerFileBackend, :error_log}],
  format: "[$level] $message\n"

config :logger, :error_log,
  path: "dev/log.log",
  level: :debug

config :midimatches, :s3_client, Midimatches.S3Client.Mock

config :bcrypt_elixir, log_rounds: 4
