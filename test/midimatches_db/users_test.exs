defmodule MidimatchesDb.UsersTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.{
    User,
    Users
  }

  test "create a new user" do
    user_params = %{
      username: "jazzyman",
      password: "abcdef1234!",
      email: "eeaasdg@gmasgd.com"
    }

    {:ok, inserted_user} = Users.create_user(user_params)

    expected_user = %User{
      username: "jazzyman",
      password: "abcdef1234!",
      email: "eeaasdg@gmasgd.com"
    }

    assertion_fields = [:username, :email]

    Enum.each(assertion_fields, fn field ->
      assert Map.get(inserted_user, field) == Map.get(expected_user, field)
    end)

    assert inserted_user.password != expected_user.password
  end

  describe "get user by credentials" do
    test "for a valid login by username" do
      user_username = "jazzyman23"
      user_password = "abcdef1234!"
      user_email = "eeaasdg@gmasgd.com"

      user_params = %{
        username: user_username,
        password: user_password,
        email: user_email
      }

      {:ok, inserted_user} = Users.create_user(user_params)

      assert inserted_user.password != user_password

      {:ok, retrieved_user} =
        Users.get_user_by_creds(%{username: user_username, password: user_password})

      expected_user = %User{
        username: user_username,
        email: user_email
      }

      assertion_fields = [:username, :email]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(retrieved_user, field) == Map.get(expected_user, field)
      end)
    end

    test "for a valid login by email" do
      user_username = "jazzyman23"
      user_password = "abcdef1234!"
      user_email = "eeaasdg@gmasgd.com"

      user_params = %{
        username: user_username,
        password: user_password,
        email: user_email
      }

      {:ok, inserted_user} = Users.create_user(user_params)

      assert inserted_user.password != user_password

      {:ok, retrieved_user} =
        Users.get_user_by_creds(%{password: user_password, email: user_email})

      expected_user = %User{
        username: user_username,
        email: user_email
      }

      assertion_fields = [:username, :email]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(retrieved_user, field) == Map.get(expected_user, field)
      end)
    end

    test "for an invalid login" do
      user_username = "jazzyman23"
      user_password = "abcdef1234!"
      user_email = "eeaasdg@gmasgd.com"

      user_params = %{
        username: user_username,
        password: user_password,
        email: user_email
      }

      {:ok, inserted_user} = Users.create_user(user_params)

      assert inserted_user.password != user_password

      resp = Users.get_user_by_creds(%{password: user_password <> " ", email: user_email})

      assert resp == {:error, "invalid password"}
    end
  end
end
