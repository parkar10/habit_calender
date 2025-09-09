#!/bin/bash

echo "🚀 Starting Habit Tracker with Cassandra..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down

# Start Cassandra
echo "📊 Starting Cassandra database..."
docker-compose up -d cassandra

# Wait for Cassandra to be healthy
echo "⏳ Waiting for Cassandra to be ready..."
while ! docker-compose exec -T cassandra cqlsh -e 'describe cluster' > /dev/null 2>&1; do
    echo "   Still waiting for Cassandra..."
    sleep 5
done

echo "✅ Cassandra is ready!"

# Initialize the database
echo "🏗️  Initializing database schema..."
docker-compose exec -T cassandra cqlsh < init-scripts/init.cql

echo "🎯 Database initialized successfully!"
echo ""
echo "Cassandra is now running on localhost:9042"
echo ""
echo "To start your backend server locally:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Or to run everything in Docker:"
echo "  docker-compose up -d"
echo ""
echo "To stop Cassandra:"
echo "  docker-compose down"