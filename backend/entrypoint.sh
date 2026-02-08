#!/bin/sh
set -e

# Extract database name from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname?schema=public
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/||' | sed 's|?.*||')

# Build admin connection URL: replace last path segment with 'postgres', strip query params
BASE_URL=$(echo "$DATABASE_URL" | sed 's|/[^/]*$||')
ADMIN_URL="${BASE_URL}/postgres"

echo "Checking if database '$DB_NAME' exists..."

DB_EXISTS=$(psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Database '$DB_NAME' not found. Creating..."
  psql "$ADMIN_URL" -c "CREATE DATABASE \"$DB_NAME\";"
  echo "Database '$DB_NAME' created successfully."
else
  echo "Database '$DB_NAME' already exists."
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/main.js
