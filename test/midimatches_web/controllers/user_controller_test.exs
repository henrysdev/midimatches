defmodule MidimatchesWeb.UserControllerTest do
  alias Midimatches.{
    TestHelpers,
    Types.User,
    UserCache
  }

  use MidimatchesWeb.ConnCase, async: true

  setup do
    on_exit(fn -> TestHelpers.flush_user_cache() end)
    :ok
  end

  test "GET /api/user/self", %{conn: conn} do
    user_id = "b4rt"
    user = %User{user_id: user_id, user_alias: "chumbawumba"}
    UserCache.upsert_user(user)

    conn =
      session_conn()
      |> put_session(:user, user)
      |> get(Routes.user_path(conn, :self))

    assert json_response(conn, 200) == %{
             "user" => %{"user_id" => "b4rt", "user_alias" => "chumbawumba"}
           }
  end

  test "GET /api/user/reset", %{conn: conn} do
    user_id = "b4rt"
    user = %User{user_id: user_id, user_alias: "chumbawumba"}
    UserCache.upsert_user(user)
    assert !is_nil(UserCache.get_user_by_id(user_id))

    conn =
      session_conn()
      |> put_session(:user, user)
      |> get(Routes.user_path(conn, :reset))

    assert json_response(conn, 200) == %{}
    assert is_nil(get_session(conn, :user))
    assert is_nil(UserCache.get_user_by_id(user_id))
  end

  describe "POST /api/user" do
    test "valid insert new user", %{conn: conn} do
      user_alias = "helloworld"

      conn =
        session_conn()
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => user_alias}))

      user_id =
        conn
        |> get_session(:user)
        |> (& &1.user_id).()

      assert %User{
               user_id: ^user_id,
               user_alias: ^user_alias,
               remote_ip: _
             } = UserCache.get_user_by_id(user_id)

      assert json_response(conn, 200) == %{}
    end

    test "valid update existing user", %{conn: conn} do
      user_id = "b4rt"
      user_alias = "chumbawumba"

      user = %User{
        user_id: user_id,
        user_alias: user_alias
      }

      UserCache.upsert_user(user)

      conn =
        session_conn()
        |> put_session(:user, user)
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => "helloworld"}))

      assert json_response(conn, 200) == %{}
      assert get_session(conn, :user) |> (& &1.user_id).() == user_id
      assert UserCache.get_user_by_id(user_id).user_alias == "helloworld"
    end

    test "invalid user_alias", %{conn: conn} do
      user_id = "b4rt"
      user_alias = "chumbawumba"

      user = %User{
        user_id: user_id,
        user_alias: user_alias
      }

      UserCache.upsert_user(user)

      conn =
        session_conn()
        |> put_session(:user, user)
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => ""}))

      assert json_response(conn, 400)["error"] =~ "user_alias"
    end
  end
end
