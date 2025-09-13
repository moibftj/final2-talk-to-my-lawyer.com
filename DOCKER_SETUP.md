# Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Development Setup

1. **Clone and navigate to the project**:
   ```bash
   cd /path/to/talk-to-my-lawyer
   ```

2. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Database: localhost:5432
   - Edge Functions: http://localhost:8000

### Environment Variables

Create a `.env` file with:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Production Deployment

### Build Production Image
```bash
docker build -t talk-to-my-lawyer:latest .
```

### Run Production Container
```bash
docker run -p 3000:80 talk-to-my-lawyer:latest
```

## Services Overview

- **app**: React frontend served by Nginx
- **supabase-db**: PostgreSQL database
- **supabase-edge-runtime**: Deno runtime for Edge Functions
- **redis**: Caching layer (optional)

## Common Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build app

# Remove all containers and volumes
docker-compose down -v
```

## Troubleshooting

1. **Port conflicts**: Ensure ports 3000, 5432, 8000, 6379 are available
2. **Build failures**: Check Docker has sufficient memory (4GB+ recommended)
3. **Database connection issues**: Verify environment variables are set correctly