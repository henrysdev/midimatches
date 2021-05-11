defmodule MidimatchesWeb.AccountControllerTest do
  use MidimatchesWeb.ConnCase

  alias MidimatchesWeb.Auth

  describe "POST /api/account/create" do
    test "succeeds with valid params", %{conn: conn} do
      conn =
        session_conn()
        |> post(
          Routes.account_path(conn, :create, %{
            "username" => "b4rt121",
            "password" => "asdgasdg111",
            "email" => "asga1@asdg.com"
          })
        )

      assert %{
               "user" => %{
                 "email" => "asga1@asdg.com",
                 "username" => "b4rt121"
               }
             } = json_response(conn, 200)
    end

    test "fails with invalid params", %{conn: conn} do
      conn =
        session_conn()
        |> post(
          Routes.account_path(conn, :create, %{
            "username" => "b4rt121",
            "password" => "ads",
            "email" => "asga2@asdg.com"
          })
        )

      expected_response = %{
        "error" => "%{password: [\"should be at least 10 character(s)\"]}"
      }

      assert json_response(conn, 400) == expected_response
    end
  end

  describe "PUT /api/account/:uuid" do
    test "update succeeds with valid params", %{conn: _conn} do
      username = "sNo00ydo0"

      user_params = %{
        "username" => username,
        "password" => "asdgasdg111",
        "email" => "jaa11@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)

      conn =
        session_conn()
        |> Auth.put_bearer_token(user.uuid)

      conn =
        put(
          conn,
          Routes.account_path(conn, :update, user.uuid, %{
            username: "b__Asdg"
          })
        )

      expected_user = %{
        "user" => %{
          "email" => "jiu9@jdid.5jd",
          "username" => "b__Asdg"
        }
      }

      actual_user = json_response(conn, 200)

      assertion_fields = ["username", "email"]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(actual_user, field) == Map.get(expected_user, field)
      end)
    end

    test "update does not succeed for uuid", %{conn: _conn} do
      new_uuid = UUID.uuid4()

      user_params = %{
        "username" => "snoopydoo",
        "password" => "asdgasdg111",
        "email" => "jiu8@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)
      user_id = user.uuid

      conn =
        session_conn()
        |> Auth.put_bearer_token(user.uuid)

      conn =
        put(
          conn,
          Routes.account_path(conn, :update, user.uuid, %{
            username: "b__Asdg"
          })
        )

      conn =
        put(
          conn,
          Routes.account_path(conn, :update, user_id, %{
            uuid: new_uuid
          })
        )

      assert json_response(conn, 200)["uuid"] != new_uuid
    end

    test "update does not succeed when no user exists to update", %{conn: _conn} do
      user_params = %{
        "username" => "snoopydoo",
        "password" => "asdgasdg111",
        "email" => "jiu7@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)
      user_id = user.uuid

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)

      conn =
        put(
          conn,
          Routes.account_path(conn, :update, UUID.uuid4(), %{
            password: "Asdgasdg"
          })
        )

      resp = json_response(conn, 404)
      assert resp == %{"error" => "%{not_found: \"user\"}"}
    end
  end

  describe "POST /api/account/login" do
    test "successful login", %{conn: _conn} do
      user_params = %{
        "username" => "b4rt121",
        "password" => "asdgasdg111",
        "email" => "jiu55@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)
      user_id = user.uuid

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)

      conn =
        conn
        |> post(
          Routes.account_path(conn, :login, %{
            "username" => "b4rt121",
            "password" => "asdgasdg111"
          })
        )

      assert json_response(conn, 200) == %{}
    end

    test "unsuccessful login", %{conn: conn} do
      user_params = %{
        "username" => "b4rt121",
        "password" => "asdgasdg111",
        "email" => "jiu4@jdid.5jd"
      }

      insert_user(user_params)

      conn =
        session_conn()
        |> post(
          Routes.account_path(conn, :login, %{
            "username" => "b4rt121",
            "password" => "idk something else?"
          })
        )

      assert json_response(conn, 401) == %{"error" => "\"invalid password\""}
    end
  end

  describe "GET /api/account/:uuid" do
    test "successfully gets user at valid uuid", %{conn: _conn} do
      user_params = %{
        "username" => "b33t121",
        "password" => "asdgasdg111",
        "email" => "jiu3@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)
      user_id = user.uuid

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)

      conn =
        conn
        |> get(Routes.account_path(conn, :show, user_id))

      expected_user = %{
        "uuid" => user_id,
        "username" => "b33t121",
        "email" => "jiu3@jdid.5jd"
      }

      actual_user = json_response(conn, 200)["user"]

      assertion_fields = ["username", "email", "uuid"]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(actual_user, field) == Map.get(expected_user, field)
      end)
    end

    test "unsuccessfully gets user when user not found", %{conn: _conn} do
      user_params = %{
        "username" => "bd3t121",
        "password" => "asdgasdg111",
        "email" => "jiu1@jdid.5jd"
      }

      {:ok, user} = MidimatchesDb.Users.create_user(user_params)
      user_id = user.uuid

      conn =
        session_conn()
        |> Auth.put_bearer_token(user_id)

      conn =
        conn
        |> get(Routes.account_path(conn, :show, UUID.uuid4()))

      assert json_response(conn, 404) == %{"error" => "%{not_found: \"user\"}"}
    end
  end
end
