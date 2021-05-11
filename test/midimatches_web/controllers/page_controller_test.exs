defmodule MidimatchesWeb.PageControllerTest do
  use MidimatchesWeb.ConnCase

  alias Midimatches.{
    BannedUsers,
    TestHelpers,
    Types.User,
    UserCache
  }

  alias MidimatchesWeb.Auth

  setup do
    on_exit(fn ->
      TestHelpers.flush_user_cache()
      TestHelpers.flush_banned_users()
    end)

    :ok
  end

  test "GET / not logged in", %{conn: _conn} do
    conn =
      session_conn()
      |> get("/")

    assert html_response(conn, 302) =~ "/about"
  end

  test "GET / with user", %{conn: _conn} do
    user_params = %User{user_alias: "zfoobar"}
    {:ok, user} = UserCache.upsert_user(user_params)

    conn =
      session_conn()
      |> Auth.put_bearer_token(user.user_id)
      |> get("/")

    assert html_response(conn, 302) =~ "/menu"
  end

  test "GET /room/:room_id/play alias redirect", %{conn: conn} do
    conn = get(conn, "/room/xyz/play")
    resp = html_response(conn, 302)
    assert resp =~ "destination=%2Froom%2Fxyz%2Fplay"
  end

  test "GET /room/:room_id/watch alias redirect", %{conn: conn} do
    conn = get(conn, "/room/xyz/watch")
    resp = html_response(conn, 302)
    assert resp =~ "destination=%2Froom%2Fxyz%2Fwatch"
  end

  describe "GET /enter" do
    test "menu dest", %{conn: conn} do
      conn = get(conn, "/enter", destination: "/menu")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "servers dest", %{conn: conn} do
      conn = get(conn, "/enter", destination: "/rooms", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "room dest", %{conn: conn} do
      conn = get(conn, "/enter", destination: "/room/1idjd3", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "practice dest", %{conn: conn} do
      conn = get(conn, "/enter", destination: "/practice", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end
  end

  describe "GET /account/reset/:reset_token" do
    test "renders react app for valid token", %{conn: _conn} do
      user_params = %User{user_alias: "zfoobar"}
      {:ok, user} = UserCache.upsert_user(user_params)
      user_id = user.user_id

      reset_token = Auth.gen_reset_token(user_id)

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)
        |> get("/account/reset/#{reset_token}")

      assert html_response(conn, 200) =~ "<div id=\"react-app\"></div>"
    end

    test "renders invalid reset link page for invalid token", %{conn: _conn} do
      user_params = %User{user_alias: "zfoobar"}
      {:ok, user} = UserCache.upsert_user(user_params)
      user_id = user.user_id

      reset_token = UUID.uuid4()

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)
        |> get("/account/reset/#{reset_token}")

      assert html_response(conn, 200) =~ "Invalid Password Reset"
    end
  end

  describe "performs banned redirect" do
    test "from /menu page", %{conn: _conn} do
      conn =
        %User{user_alias: "banme"}
        |> setup_banned_user()
        |> get("/menu")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /rooms page", %{conn: _conn} do
      conn =
        %User{user_alias: "banme1"}
        |> setup_banned_user()
        |> get("/rooms")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /room/xyz page", %{conn: _conn} do
      conn =
        %User{user_alias: "banme2"}
        |> setup_banned_user()
        |> get("/room/xyz")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /practice page", %{conn: _conn} do
      conn =
        %User{user_alias: "banme3"}
        |> setup_banned_user()
        |> get("/room/xyz")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /enter page", %{conn: _conn} do
      conn =
        %User{user_alias: "banme"}
        |> setup_banned_user()
        |> get("/enter")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end
  end

  @spec setup_banned_user(map()) :: Plug.Conn.t()
  defp setup_banned_user(user_params) do
    {:ok, %User{user_id: user_id} = user} = UserCache.upsert_user(user_params)
    BannedUsers.add_banned_user(user_id)

    session_conn()
    |> Auth.put_bearer_token(user_id)
    |> assign(:auth_user, user)
  end
end
