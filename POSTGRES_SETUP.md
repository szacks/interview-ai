# Task 4: Set up local PostgreSQL with Docker

## Completed Setup

### 1. Docker Compose Configuration
**File**: `docker-compose.yml`

The docker-compose file includes:
- **PostgreSQL 15 Alpine**: Lightweight PostgreSQL container
- **PgAdmin 4**: Web-based database management tool (optional)
- **Named Volume**: `postgres_data` for persistent data storage
- **Custom Network**: `interviewai_network` for container communication
- **Health Checks**: Automatic verification that PostgreSQL is ready
- **Environment Variables**: Configurable via .env file

### 2. Volume Configuration
- **Data Volume**: `postgres_data` - Stores all database files persistently
- **Init Scripts**: `./init-scripts` mounted at `/docker-entrypoint-initdb.d` for automatic database initialization
- **Automatic Backup**: Volume is stored locally and persists across container restarts

### 3. Database Initialization
**File**: `init-scripts/01-init.sql`

Automatically runs on first container startup:
- Creates UUID extension for unique identifiers
- Ready for JPA/Hibernate schema creation
- Can be extended with additional initialization scripts

## How to Use

### Start PostgreSQL
```bash
docker-compose up -d
```

### Stop PostgreSQL
```bash
docker-compose down
```

### View Container Status
```bash
docker-compose ps
```

### Access PostgreSQL via CLI
```bash
docker exec interviewai_postgres psql -U postgres -d interviewai_db
```

### Access PgAdmin (Web UI)
- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

### Configuration via Environment Variables
Edit the `.env` file:
- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `DB_NAME`: Database name (default: interviewai_db)
- `DB_PORT`: Port to expose (default: 5432)

## Connection Testing

### Test Command
```bash
docker exec interviewai_postgres psql -U postgres -d interviewai_db -c "SELECT version();"
```

### Test Result
```
PostgreSQL 15.15 on x86_64-pc-linux-musl, compiled by gcc (Alpine 14.2.0) 14.2.0, 64-bit
```

✓ Connection successful

## Connecting from Spring Boot

The application uses the following connection details (from `application.yml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/interviewai_db
    username: postgres
    password: postgres
```

## Data Persistence

The `postgres_data` volume ensures:
- Database survives container restarts
- Data persists even after stopping containers
- To completely reset, run: `docker-compose down -v`

## Network Configuration

Services communicate via `interviewai_network` bridge:
- PostgreSQL accessible at `postgres:5432` from other containers
- Services can reference each other by hostname
- Port 5432 exposed to host machine for local development

## Troubleshooting

### PostgreSQL not ready
- Check logs: `docker-compose logs postgres`
- Wait for health check to pass: `docker-compose ps`

### Permission denied
- Ensure Docker daemon is running
- Add your user to docker group: `sudo usermod -aG docker $USER`

### Port already in use
- Change port in docker-compose.yml or .env
- Or stop the process using port 5432

## Testing Status
✓ Containers running
✓ PostgreSQL healthy
✓ Database accessible
✓ Table creation/insertion tested
✓ Ready for Spring Boot application
