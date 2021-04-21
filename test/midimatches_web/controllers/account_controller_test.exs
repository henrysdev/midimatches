defmodule MidimatchesWeb.AccountControllerTest do
  use MidimatchesWeb.ConnCase
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    Repo,
    User
  }

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

  def insert_user(%{} = user_params) do
    User.changeset(%User{}, user_params)
    |> Repo.insert!()
  end
end
