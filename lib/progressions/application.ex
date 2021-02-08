defmodule Progressions.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  alias Progressions.{
    Matchmaking.ServerlistUpdater,
    Types.Configs
  }

  alias ProgressionsWeb.PresenceTracker

  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      ProgressionsWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Progressions.PubSub},
      # Start the Endpoint (http/https)
      ProgressionsWeb.Endpoint,
      # Start a worker by calling: Progressions.Worker.start_link(arg)
      {DynamicSupervisor, strategy: :one_for_one, name: Progressions.Rooms},
      {Registry, keys: :unique, name: ProcessRegistry},
      {ServerlistUpdater, []},
      {Task, fn -> configure() end},
      {PresenceTracker, [name: PresenceTracker, pubsub_server: Progressions.PubSub]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Progressions.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ProgressionsWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  @spec configure :: :ok
  def configure do
    :progressions
    |> Application.fetch_env!(:rooms_config)
    |> Configs.parse_config()
    |> (& &1.rooms).()
    |> Progressions.Rooms.configure_rooms()
  end
end
