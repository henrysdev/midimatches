defmodule MidimatchesDb.Repo.Migrations.UsersUsernameCheckConstraintTriggerAdjustment do
  use Ecto.Migration

  def change do
    execute(
      # up
      ~S"""
      DROP TRIGGER users_username_availability_check ON users;
      """,

      # down
      ~S"""
      CREATE TRIGGER users_username_availability_check
      BEFORE INSERT ON users
      FOR EACH ROW
      EXECUTE PROCEDURE users_check_username_availability();
      """
    )

    execute(
      # up
      "DROP FUNCTION users_check_username_availability;",

      # down
      ~S"""
      CREATE FUNCTION users_check_username_availability() RETURNS TRIGGER AS
      $$
      BEGIN
      IF EXISTS(
        SELECT 1
        FROM users u
        WHERE u.username = NEW.username
        AND u.registered = true
      )
      THEN
        RAISE unique_violation USING CONSTRAINT = 'username_unavailable';
      END IF;
      RETURN NEW;
      END;
      $$ language plpgsql;
      """
    )

    execute(
      # up
      ~S"""
      CREATE FUNCTION users_check_username_availability() RETURNS TRIGGER AS
      $$
      BEGIN
      IF EXISTS(
        SELECT 1
        FROM users u
        WHERE u.username = NEW.username
        AND u.registered = true
        AND u.id != NEW.id
      )
      THEN
        RAISE unique_violation USING CONSTRAINT = 'username_unavailable';
      END IF;
      RETURN NEW;
      END;
      $$ language plpgsql;
      """,

      # down
      "DROP FUNCTION users_check_username_availability;"
    )



    execute(
      # up
      ~S"""
      CREATE TRIGGER users_username_availability_check
      BEFORE INSERT OR UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE users_check_username_availability();
      """,

      # down
      ~S"""
      DROP TRIGGER users_username_availability_check ON users;
      """
    )
  end
end
