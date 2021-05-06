defmodule Midimatches.UserCacheTest do
  use ExUnit.Case
  use MidimatchesDb.RepoCase

  alias Midimatches.{
    TestHelpers,
    Types.User,
    UserCache
  }

  setup do
    on_exit(fn -> TestHelpers.flush_user_cache() end)
    :ok
  end

  describe "upsert user" do
    test "for a new user to the user cache" do
      user_alias = "foobarzooa"

      user = %User{
        user_alias: user_alias
      }

      {:ok, upserted_user} = UserCache.upsert_user(user)
      assert %User{user_alias: ^user_alias} = upserted_user
    end

    test "for an existing user to the user cache" do
      orig_user = %User{
        user_alias: "foobarzoo"
      }

      {:ok, orig_inserted_user} = UserCache.upsert_user(orig_user)
      {:ok, found_orig_user} = UserCache.get_user_by_id(orig_inserted_user.user_id)

      assert found_orig_user.user_alias == orig_user.user_alias

      UserCache.upsert_user(%User{found_orig_user | user_alias: "barzeeedo"})
      {:ok, found_upserted_user} = UserCache.get_user_by_id(orig_inserted_user.user_id)

      assert found_upserted_user.user_alias == "barzeeedo"
    end
  end

  describe "get a user" do
    test "that exists in the user cache" do
      user = %User{
        user_alias: "foobarzoo"
      }

      {:error, _} = UserCache.get_user_by_id(UUID.uuid4())

      {:ok, %User{user_id: user_id}} = UserCache.upsert_user(user)

      {:ok, found_user_after} = UserCache.get_user_by_id(user_id)
      assert(!is_nil(found_user_after))
    end

    test "that does not exist in the user cache" do
      {:error, reason} = UserCache.get_user_by_id(UUID.uuid4())
      assert ^reason = %{not_found: "user"}
    end
  end

  test "checks that user exists in user cache" do
    user = %User{
      user_alias: "foobarzoo"
    }

    assert UserCache.user_id_exists?(UUID.uuid4()) == false
    {:ok, upserted_user} = UserCache.upsert_user(user)
    assert UserCache.user_id_exists?(upserted_user.user_id) == true
  end

  test "delete a user from the user cache" do
    user = %User{
      user_alias: "foobarzoo"
    }

    {:ok, %User{user_id: user_id}} = UserCache.upsert_user(user)

    {:ok, found_user_before} = UserCache.get_user_by_id(user_id)
    assert(!is_nil(found_user_before))

    {:ok, _} = UserCache.delete_user_by_id(user_id)

    assert {:error, %{not_found: "user"}} == UserCache.get_user_by_id(user_id)
  end

  # describe "get or insert" do
  #   test "a new user into the user cache" do
  #     user_id = UUID.uuid4()

  #     user = %User{
  #       user_id: user_id,
  #       user_alias: "foobarzoo"
  #     }

  #     returned_user = UserCache.get_or_insert_user(user)

  #     assert returned_user == user
  #   end

  #   test "an existing user into the user cache" do
  #     user_id = UUID.uuid4()

  #     user = %User{
  #       user_id: user_id,
  #       user_alias: "foobarzoo"
  #     }

  #     updated_user = %User{
  #       user_id: user_id,
  #       user_alias: "flabbergast"
  #     }

  #     UserCache.upsert_user(user)

  #     returned_user = UserCache.get_or_insert_user(updated_user)

  #     assert returned_user == user
  #   end
  # end
end
