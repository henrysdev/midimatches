use Mix.Config

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
