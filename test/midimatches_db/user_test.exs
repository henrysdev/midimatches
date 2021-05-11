defmodule MidimatchesDb.UserTest do
  use MidimatchesDb.RepoCase

  alias MidimatchesDb.User

  test "insert user" do
    fields = %{
      "username" => "person1",
      "email" => "myemail@gmail",
      "password" => "foobaraaaa"
    }

    changeset = User.changeset(%User{}, fields)

    assert changeset.valid?
  end

  describe "validation error" do
    test "when missing params" do
      fields = %{"asg" => 0}

      changeset = User.changeset(%User{}, fields)

      changeset_error = traverse_errors(changeset)

      expected_error = %{
        username: ["can't be blank"],
        email: ["can't be blank"],
        password: ["can't be blank"]
      }

      assert !changeset.valid?
      assert changeset_error == expected_error
    end

    test "when profanity in username" do
      fields = %{
        "username" => "ass",
        "email" => "myemail@gmail",
        "password" => "foobarasaaaaa"
      }

      changeset = User.changeset(%User{}, fields)

      changeset_error = traverse_errors(changeset)

      expected_error = %{
        username: ["profane language detected"]
      }

      assert !changeset.valid?
      assert changeset_error == expected_error
    end

    test "when params are too short" do
      fields = %{
        "username" => "p1",
        "email" => "myemail@gmail",
        "password" => "foobar"
      }

      changeset = User.changeset(%User{}, fields)

      changeset_error = traverse_errors(changeset)

      expected_error = %{
        username: ["should be at least 3 character(s)"],
        password: ["should be at least 10 character(s)"]
      }

      assert !changeset.valid?
      assert changeset_error == expected_error
    end

    test "when params are too long" do
      fields = %{
        "username" => "p1asdgasdgasdgasdgasdgasdg",
        "email" => "myemail@gmail",
        "password" => "foobarasjdglajsd;gljasl;dgjlaksdjgl;kasdjglkjasdl;kgjl;aksdg"
      }

      changeset = User.changeset(%User{}, fields)

      changeset_error = traverse_errors(changeset)

      expected_error = %{
        username: ["should be at most 20 character(s)"]
      }

      assert !changeset.valid?
      assert changeset_error == expected_error
    end
  end

  defp traverse_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
