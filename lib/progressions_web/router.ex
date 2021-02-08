defmodule ProgressionsWeb.Router do
  use ProgressionsWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :auth_user
    plug :put_user_token
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  scope "/", ProgressionsWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/room/:room_id", PageController, :room
    get "/room/debug_create/:room_id", PageController, :debug_create_room
  end

  scope "/user/", ProgressionsWeb do
    pipe_through :browser

    post "/user/register", UserController, :register
  end

  # Other scopes may use custom stacks.
  # scope "/api", ProgressionsWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: ProgressionsWeb.Telemetry
    end
  end

  defp auth_user(conn, _) do
    user_id = Progressions.Utils.gen_uuid()
    conn |> assign(:current_user, %{id: user_id})
  end

  defp put_user_token(conn, _) do
    if current_user = conn.assigns[:current_user] do
      token = Phoenix.Token.sign(conn, "user socket", current_user.id)
      assign(conn, :user_token, token)
    else
      conn
    end
  end
end
