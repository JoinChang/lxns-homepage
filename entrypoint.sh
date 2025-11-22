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

if [ "$NODE_ENV" = "production" ]; then
  echo "Applying migrations for production..."
  npx prisma migrate deploy
else
  echo "Applying migrations for development..."
  npx prisma migrate dev
fi

exec "$@"