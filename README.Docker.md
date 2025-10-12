# Docker Setup for Talk to My Lawyer

This document explains how to run the Talk to My Lawyer application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

1. **Build and run the application:**
   ```bash
   docker compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Docker Files Overview

### Dockerfile
- **Multi-stage build**: Uses Node.js for building and Nginx for serving
- **Build stage**: Installs dependencies and builds the Vite application
- **Production stage**: Serves the built files using Nginx

### compose.yaml
- **app service**: Builds and runs the main application
- **Port mapping**: Maps container port 80 to host port 3000
- **Environment**: Sets production environment variables

### .dockerignore
Excludes unnecessary files from the Docker build context:
- `node_modules` (will be installed fresh in container)
- Development files and configurations
- Git files and build artifacts

## Development vs Production

### Development
For local development, continue using:
```bash
npm run dev
```

### Production (Docker)
For production-like environment:
```bash
docker compose up --build
```

## Environment Variables

Make sure to set up your environment variables:

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials and other required variables
3. The Docker container will use these for the build process

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the port mapping in `compose.yaml`:
```yaml
ports:
  - "3001:80"  # Use port 3001 instead
```

### Build Errors
1. Ensure `package.json` and `package-lock.json` are present
2. Check that all environment variables are set
3. Review the build logs for specific error messages

### Supabase Integration
The application expects Supabase to be configured. Make sure your:
- Supabase URL is correct
- API keys are valid
- Database migrations are applied

## Optional: Local Database

Uncomment the Supabase service in `compose.yaml` to run a local PostgreSQL instance for development.

## Deployment

For production deployment:
1. Use the Dockerfile in your CI/CD pipeline
2. Set production environment variables
3. Consider using a proper reverse proxy (nginx, traefik, etc.)
4. Set up SSL/TLS certificates

## Commands Reference

```bash
# Build and start
docker compose up --build

# Start in background
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs

# Rebuild specific service
docker compose build app
```