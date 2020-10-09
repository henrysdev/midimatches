defmodule Progressions.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

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
      Progressions.Telemetry.EventLog
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
end
