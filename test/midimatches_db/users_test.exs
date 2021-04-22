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

  describe "update a user account" do
    test "successfully via a valid changeset" do
      user_username = "jazzyman23"
      user_password = "abcdef1234!"
      user_email = "eeaasdg@gmasgd.com"

      user_id =
        insert_user(%{
          username: user_username,
          password: user_password,
          email: user_email
        }).uuid

      {:ok, updated_user} =
        Users.update_user(user_id, %{
          username: "new_username",
          password: "new_password"
        })

      expected_user = %User{
        username: "new_username",
        email: user_email,
        uuid: user_id
      }

      assertion_fields = [:username, :email, :uuid]

      Enum.each(assertion_fields, fn field ->
        assert Map.get(updated_user, field) == Map.get(expected_user, field)
      end)
    end

    test "unsuccessfully via an invalid changeset" do
      user_username = "jazzyman23"
      user_password = "abcdef1234!"
      user_email = "eeaasdg@gmasgd.com"

      user_id =
        insert_user(%{
          username: user_username,
          password: user_password,
          email: user_email
        }).uuid

      new_uuid = UUID.uuid4()
      resp = Users.update_user(user_id, %{uuid: new_uuid})

      assert resp ==
               {:error,
                %{
                  uuid: ["One of these change fields must not be present: [:uuid, :token_serial]"]
                }}
    end

    test "unsuccessfully via user uuid not found" do
      user_id = UUID.uuid4()

      resp =
        Users.update_user(user_id, %{
          username: "new_username",
          password: "new_password"
        })

      assert resp == {:error, %{not_found: "user"}}
    end
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
