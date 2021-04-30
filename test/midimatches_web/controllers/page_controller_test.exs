defmodule MidimatchesWeb.PageControllerTest do
  use MidimatchesWeb.ConnCase

  alias Midimatches.{
    BannedUsers,
    TestHelpers,
    Types.User,
    UserCache
  }

  setup do
    on_exit(fn ->
      TestHelpers.flush_user_cache()
      TestHelpers.flush_banned_users()
    end)

    :ok
  end

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 302) =~ "/about"
  end

  test "GET /room/:room_id/play alias redirect", %{conn: conn} do
    conn = get(conn, "/room/xyz/play")
    resp = html_response(conn, 302)
    assert resp =~ "/room/xyz"
    assert resp =~ "audience=false"
  end

  test "GET /room/:room_id/watch alias redirect", %{conn: conn} do
    conn = get(conn, "/room/xyz/watch")
    resp = html_response(conn, 302)
    assert resp =~ "/room/xyz"
    assert resp =~ "audience=true"
  end

  describe "GET /register" do
    test "menu dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/menu")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "servers dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/rooms", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "room dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/room/1idjd3", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end

    test "practice dest", %{conn: conn} do
      conn = get(conn, "/register", destination: "/practice", user_alias: "abkd")
      assert html_response(conn, 200) =~ "urlDestination"
    end
  end

  describe "performs banned redirect" do
    test "from /menu page", %{conn: _conn} do
      conn =
        %User{user_id: UUID.uuid4(), user_alias: "banme"}
        |> setup_banned_user()
        |> get("/menu")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /rooms page", %{conn: _conn} do
      conn =
        %User{user_id: UUID.uuid4(), user_alias: "banme"}
        |> setup_banned_user()
        |> get("/rooms")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /room/xyz page", %{conn: _conn} do
      conn =
        %User{user_id: UUID.uuid4(), user_alias: "banme"}
        |> setup_banned_user()
        |> get("/room/xyz")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /practice page", %{conn: _conn} do
      conn =
        %User{user_id: UUID.uuid4(), user_alias: "banme"}
        |> setup_banned_user()
        |> get("/room/xyz")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end

    test "from /register page", %{conn: _conn} do
      conn =
        %User{user_id: UUID.uuid4(), user_alias: "banme"}
        |> setup_banned_user()
        |> get("/register")

      assert html_response(conn, 200) =~ "Temporary Ban"
    end
  end

  @spec setup_banned_user(%User{}) :: Plug.Conn.t()
  defp setup_banned_user(%User{user_id: user_id} = user) do
    UserCache.upsert_user(user)
    BannedUsers.add_banned_user(user_id)

    session_conn()
    |> put_session(:user, user)
  end
end
