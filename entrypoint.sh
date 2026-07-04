#!/bin/bash

echo "Waiting for database..."
until nc -z db 5432; do
  sleep 1
done
echo "Database is up!"

echo "Waiting for redis..."
until nc -z redis 6379; do
  sleep 1
done
echo "Redis is up!"

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running prisma migrate deploy..."
  ./node_modules/.bin/prisma migrate deploy
else
  echo "Skipping prisma migrations"
fi

exec "$@"