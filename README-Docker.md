# Docker Setup for Habit Tracker

## Quick Start with Cassandra

### Option 1: Start just Cassandra (Recommended)

1. **Start Docker Desktop**

2. **Start Cassandra only:**
   ```bash
   docker-compose up -d cassandra
   ```

3. **Wait for Cassandra to be ready (about 60 seconds):**
   ```bash
   # Check if Cassandra is ready
   docker-compose logs -f cassandra
   # Wait until you see "Starting listening for CQL clients"
   ```

4. **Initialize the database:**
   ```bash
   # Run the initialization script
   docker-compose exec cassandra cqlsh < init-scripts/init.cql
   ```

5. **Start your backend locally:**
   ```bash
   cd backend
   npm run build
   npm run start  # Now uses Cassandra instead of in-memory
   ```

6. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

### Option 2: Everything in Docker

```bash
# Start both Cassandra and backend
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 3: Use the convenience script

```bash
# Make sure Docker Desktop is running first
./start-cassandra.sh
```

## Commands

```bash
# Start only Cassandra
docker-compose up -d cassandra

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f cassandra
docker-compose logs -f backend

# Stop everything
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Connect to Cassandra shell
docker-compose exec cassandra cqlsh

# Check Cassandra status
docker-compose exec cassandra nodetool status
```

## Database Access

- **Cassandra**: `localhost:9042`
- **Backend**: `localhost:3001`
- **Frontend**: `localhost:3000`

## Troubleshooting

1. **Cassandra takes time to start** - Wait 60-90 seconds for first startup
2. **Backend can't connect** - Make sure Cassandra is fully ready before starting backend
3. **Port conflicts** - Make sure ports 9042 and 3001 are not in use
4. **Docker not running** - Start Docker Desktop first

## Data Persistence

Data is stored in a Docker volume and will persist between restarts. To completely reset:
```bash
docker-compose down -v
```