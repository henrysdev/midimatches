defmodule Midimatches.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  alias Midimatches.{
    Matchmaking.ServerlistUpdater,
    RoomsGarbageCollector,
    Types.Configs
  }

  alias MidimatchesWeb.PresenceTracker

  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      MidimatchesWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Midimatches.PubSub},
      # Start the Endpoint (http/https)
      MidimatchesWeb.Endpoint,
      # Start a worker by calling: Midimatches.Worker.start_link(arg)
      {DynamicSupervisor, strategy: :one_for_one, name: Midimatches.Rooms},
      {Registry, keys: :unique, name: ProcessRegistry},
      {ServerlistUpdater, [{3_000}]},
      {RoomsGarbageCollector, []},
      {Task, fn -> configure() end},
      {PresenceTracker, [name: PresenceTracker, pubsub_server: Midimatches.PubSub]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Midimatches.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    MidimatchesWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  @spec configure :: :ok
  def configure do
    :midimatches
    |> Application.fetch_env!(:rooms_config)
    |> Configs.parse_config()
    |> (& &1.rooms).()
    |> Midimatches.Rooms.configure_rooms()
  end
end
