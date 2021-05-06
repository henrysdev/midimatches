defmodule MidimatchesWeb.UserControllerTest do
  alias Midimatches.{
    TestHelpers,
    Types.User,
    UserCache
  }

  use MidimatchesWeb.ConnCase

  setup do
    on_exit(fn -> TestHelpers.flush_user_cache() end)
    :ok
  end

  test "GET /api/user/self", %{conn: conn} do
    user_alias = "chnumbawumba"
    {:ok, user} = UserCache.upsert_user(%User{user_alias: user_alias})

    conn =
      session_conn()
      |> assign(:auth_user, user)
      |> get(Routes.user_path(conn, :self))

    assert json_response(conn, 200) == %{
             "user" => %{"user_id" => user.user_id, "user_alias" => user_alias}
           }
  end

  test "GET /api/user/reset", %{conn: conn} do
    user_params = %User{user_alias: "zhumbawu"}
    {:ok, %User{user_id: user_id} = user} = UserCache.upsert_user(user_params)
    {:ok, found_user} = UserCache.get_user_by_id(user_id)
    assert !is_nil(found_user)

    conn =
      session_conn()
      |> assign(:auth_user, user)
      |> get(Routes.user_path(conn, :reset))

    assert json_response(conn, 200) == %{}
    assert is_nil(get_session(conn, :auth_user))
    assert {:error, %{not_found: "user"}} == UserCache.get_user_by_id(user_id)
  end

  describe "POST /api/user" do
    test "valid insert new user", %{conn: conn} do
      user_alias = "hellowozz"

      conn =
        session_conn()
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => user_alias}))

      {:ok, user} = MidimatchesDb.Users.get_user_by(:username, user_alias)
      user_id = user.uuid

      {:ok, user} = UserCache.get_user_by_id(user_id)

      assert %User{
               user_id: ^user_id,
               user_alias: ^user_alias,
               remote_ip: _
             } = user

      assert json_response(conn, 200) == %{}
    end

    test "valid update existing user", %{conn: conn} do
      user_alias = "hellow4zz"

      {:ok, %User{user_id: user_id} = user} =
        UserCache.upsert_user(%User{
          user_alias: user_alias
        })

      conn =
        session_conn()
        |> assign(:auth_user, user)
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => user_alias}))

      assert json_response(conn, 200) == %{}
      {:ok, user} = UserCache.get_user_by_id(user_id)
      assert user.user_alias == user_alias
    end

    test "invalid user_alias due to invalid length", %{conn: conn} do
      user_params = %User{
        user_alias: "khumbawumba"
      }

      {:ok, user} = UserCache.upsert_user(user_params)

      conn =
        session_conn()
        |> assign(:auth_user, user)
        |> post(
          Routes.user_path(conn, :upsert, %{"user_alias" => "asljdkf;alskjdf;lkajsd;flkjasd;lf"})
        )

      resp = json_response(conn, 400)
      error_str = resp["error"] |> inspect()
      assert error_str =~ "username"
      assert error_str =~ "should be at most 20"
    end

    test "invalid user_alias due to profanity", %{conn: conn} do
      user_alias = "bhumbawumba"

      user_params = %User{
        user_alias: user_alias
      }

      {:ok, user} = UserCache.upsert_user(user_params)

      conn =
        session_conn()
        |> assign(:auth_user, user)
        |> post(Routes.user_path(conn, :upsert, %{"user_alias" => "hell"}))

      resp = json_response(conn, 400)

      error_str = resp["error"] |> inspect()
      assert error_str =~ "username"
      assert error_str =~ "profane"
    end
  end
end
