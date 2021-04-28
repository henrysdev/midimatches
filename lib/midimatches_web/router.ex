defmodule MidimatchesWeb.Router do
  use MidimatchesWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :auth_user_socket
    plug :put_user_socket_token
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  # TODO integrate into API pipeline
  pipeline :auth do
    plug :verify_bearer_token
  end

  scope "/", MidimatchesWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/about", PageController, :about
    get "/privacy", PageController, :privacy
    get "/terms", PageController, :terms
    get "/menu", PageController, :menu
    get "/rooms", PageController, :serverlist
    get "/room/:room_id/play", PageController, :room_play
    get "/room/:room_id/watch", PageController, :room_watch
    get "/room/:room_id", PageController, :room
    get "/register", PageController, :register_player
    get "/practice", PageController, :practice
    # get "/account/reset/:slug", PageController, :reset_password
  end

  scope "/api", MidimatchesWeb do
    pipe_through :api

    get "/user/self", UserController, :self
    post "/user", UserController, :upsert
    get "/user/sync", UserController, :sync
    get "/samples/random", SampleController, :random
    post "/room", RoomController, :create
    post "/", AccountController, :create
    put "/:uuid", AccountController, :update
    get "/:uuid", AccountController, :show
    post "/login", AccountController, :login
    post "/logout", AccountController, :logout
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/api", MidimatchesWeb do
      pipe_through :api
      get "/user/reset", UserController, :reset
    end

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: MidimatchesWeb.Telemetry
    end
  end
end
