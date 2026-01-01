# Task 3: Configure application.yml and environment variables

## Completed Tasks

### 1. Created application.yml (Main Configuration File)
- **Location**: `backend/src/main/resources/application.yml`
- **Includes**:
  - PostgreSQL database connection configuration
  - JPA/Hibernate settings with PostgreSQL dialect
  - Spring Security CORS configuration
  - JWT configuration with secret and expiration times
  - Claude Haiku 4.5 API configuration
  - Docker sandbox configuration for Java, Python, and Node
  - Resend email service configuration
  - Server port configuration (default: 8080)
  - Logging configuration

### 2. Created application-dev.yml (Development Profile)
- **Location**: `backend/src/main/resources/application-dev.yml`
- **Includes**:
  - SQL query logging enabled
  - Debug logging for Spring Security and Web components
  - Hibernate SQL logging with parameter binding

### 3. Created application-prod.yml (Production Profile)
- **Location**: `backend/src/main/resources/application-prod.yml`
- **Includes**:
  - Production-optimized database connection pooling (Hikari)
  - Disabled SQL logging for performance
  - Minimal logging (WARN level)
  - Compression enabled for responses

### 4. Created .env file (Local Development)
- **Location**: `backend/.env`
- Contains default development values for all environment variables
- Includes placeholders for API keys (Claude, Resend)

### 5. Created .env.example file (Template)
- **Location**: `backend/.env.example`
- Template file for developers to copy and configure
- Clear documentation of all required environment variables

### 6. Created Configuration Classes
1. **EnvironmentConfig.java**: Loads .env file using dotenv-java library
2. **JwtProperties.java**: Maps JWT configuration from application.yml
3. **ClaudeProperties.java**: Maps Claude API configuration
4. **DockerProperties.java**: Maps Docker sandbox image configurations
5. **CorsConfig.java**: Configures CORS with environment-specific allowed origins

### 7. Updated build.gradle
- Added `spring-boot-starter-mail` for email functionality
- Added `dotenv-java` library for environment variable loading

### 8. Updated .gitignore
- Added rules to ignore `.env` files to prevent committing secrets

## Environment Variables

The following environment variables can be configured:

```
# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interviewai_db

# Server
SERVER_PORT=8080

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Claude API
CLAUDE_API_KEY=your-api-key

# Resend Email
RESEND_API_KEY=your-api-key

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_SANDBOX_JAVA_IMAGE=interviewai-java-sandbox:latest
DOCKER_SANDBOX_PYTHON_IMAGE=interviewai-python-sandbox:latest
DOCKER_SANDBOX_NODE_IMAGE=interviewai-node-sandbox:latest

# Mail
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
```

## How to Use

### Development
1. Copy `.env.example` to `.env`
2. Update values in `.env` with your local configuration
3. Run the application with: `./gradlew bootRun`
4. The dotenv library will automatically load variables from `.env`

### Production
1. Set environment variables in your deployment environment
2. The application will use system environment variables (no .env file needed)
3. Run with: `java -jar interviewAI.jar --spring.profiles.active=prod`

## Build Status
✓ Build successful - all configurations have been compiled and verified
