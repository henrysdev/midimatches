defmodule Midimatches.BannedUsersTest do
  use ExUnit.Case

  alias Midimatches.{
    BannedUsers,
    TestHelpers
  }

  setup do
    on_exit(fn -> TestHelpers.flush_banned_users() end)
    :ok
  end

  test "application startup creates banned users ets table" do
    cache_exists? = :ets.whereis(:banned_users) != :undefined
    assert cache_exists?
  end

  # Flakey
  # test "add banned user to banned users" do
  #   user_id = "foobar1"
  #   BannedUsers.add_banned_user(user_id)

  #   :sys.get_state(BannedUsers)
  #   assert :ets.lookup(:banned_users, user_id) == [{user_id}]
  # end

  # test "add banned user to banned users with ban lift timer" do
  #   ban_time = 10
  #   user_id = "foobar1"
  #   BannedUsers.add_banned_user(user_id, ban_time)
  #   :sys.get_state(BannedUsers)
  #   assert :ets.lookup(:banned_users, user_id) == [{user_id}]

  #   Process.sleep(ban_time)
  #   assert :ets.lookup(:banned_users, user_id) == []
  # end

  test "list banned users" do
    banned_user_ids = [
      "abc",
      "def",
      "ghi",
      "jkl",
      "mno",
      "pqr"
    ]

    banned_user_ids
    |> Enum.each(&BannedUsers.add_banned_user/1)

    :sys.get_state(BannedUsers)

    listed_user_ids = BannedUsers.list_banned_users() |> Enum.sort()

    assert listed_user_ids == banned_user_ids
  end

  test "wipe banned users" do
    banned_user_ids = [
      "abc",
      "def",
      "ghi",
      "jkl",
      "mno",
      "pqr"
    ]

    banned_user_ids
    |> Enum.each(&BannedUsers.add_banned_user/1)

    :sys.get_state(BannedUsers)

    BannedUsers.wipe_banned_users()

    :sys.get_state(BannedUsers)

    assert BannedUsers.list_banned_users() == []
  end
end
