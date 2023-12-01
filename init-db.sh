#!/bin/bash
set -e

echo "Starting init-db.sh script..."

# Execute the default entrypoint for PostgreSQL
echo "Starting PostgreSQL server..."
exec docker-entrypoint.sh postgres &

# Wait for PostgreSQL to become available
until pg_isready -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Waiting for postgres to become available..."
  sleep 2
done

# Function to execute commands in PostgreSQL
function create_database() {
  echo "Creating database and user..."
  psql -v ON_ERROR_STOP=1 -e --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create a user and grant privileges
    DO
    \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
      END IF;
    END
    \$\$;
    CREATE DATABASE $DB_NAME;
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

  psql -v ON_ERROR_STOP=1 -e --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
EOSQL

  echo "Database and user created."
}

# Execute the entrypoint script
if [ -n "$DB_NAME" ]; then
  create_database
fi

echo "init-db.sh script finished."

# Create a file to indicate that initialization is complete
touch /var/lib/postgresql/data/db_initialized

# Keep the postgres container running after database initialization
tail -f /dev/null
