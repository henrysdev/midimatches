defmodule MidimatchesWeb.AccountControllerTest do
  use MidimatchesWeb.ConnCase
  use MidimatchesDb.RepoCase

  describe "POST /api/account/create" do
    test "succeeds with valid params", %{conn: conn} do
      conn =
        session_conn()
        |> post(
          Routes.account_path(conn, :create, %{
            "username" => "b4rt121",
            "password" => "asdgasdg111",
            "email" => "asga@asdg.com"
          })
        )

      assert %{
               "user" => %{
                 "email" => "asga@asdg.com",
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
            "email" => "asga@asdg.com"
          })
        )

      expected_response = %{
        "error" => %{
          "password" => ["should be at least 10 character(s)"]
        }
      }

      assert json_response(conn, 400) == expected_response
    end
  end

  describe "PUT /api/account/" do
    test "update succeeds with valid params", %{conn: conn} do
      user_params = %{
        "username" => "snoopydoo",
        "password" => "asdgasdg111",
        "email" => "jiu@jdid.5jd"
      }

      user_id = insert_user(user_params).uuid

      conn =
        session_conn()
        |> put(
          Routes.account_path(conn, :update, user_id, %{
            username: "b4rtyy"
          })
        )

      expected_user = %{
        "user" => %{
          "email" => "jiu@jdid.5jd",
          "username" => "b4rtyy"
        }
      }

      actual_user = json_response(conn, 200)

      assertion_fields = ["username", "email"]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(actual_user, field) == Map.get(expected_user, field)
      end)
    end

    test "update does not succeed for uuid", %{conn: conn} do
      user_params = %{
        "username" => "snoopydoo",
        "password" => "asdgasdg111",
        "email" => "jiu@jdid.5jd"
      }

      user_id = insert_user(user_params).uuid
      new_uuid = UUID.uuid4()

      conn =
        session_conn()
        |> put(
          Routes.account_path(conn, :update, user_id, %{
            uuid: new_uuid
          })
        )

      assert json_response(conn, 200)["uuid"] != new_uuid
    end

    test "update does not succeed when no user exists to update", %{conn: conn} do
      conn =
        session_conn()
        |> put(
          Routes.account_path(conn, :update, UUID.uuid4(), %{
            password: "Asdgasdg"
          })
        )

      resp = json_response(conn, 400)
      assert resp == %{"error" => %{"not_found" => "user"}}
    end
  end

  describe "POST /api/account/login" do
    test "successful login", %{conn: conn} do
      user_params = %{
        "username" => "b4rt121",
        "password" => "asdgasdg111",
        "email" => "jiu@jdid.5jd"
      }

      insert_user(user_params)

      conn =
        session_conn()
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
        "email" => "jiu@jdid.5jd"
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

      assert json_response(conn, 401) == %{"error" => "invalid password"}
    end
  end
end
