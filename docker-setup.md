# Docker Setup for talk-to-my-lawyer

## Prerequisites

1. Install Docker and Docker Compose
2. Make sure Docker is running

## Quick Start

### Development Environment

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

Access your application:
- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:54321
- **API**: http://localhost:54323

### Production Environment

```bash
# Build and start production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop production environment
docker-compose down
```

Access your application:
- **Frontend**: http://localhost:3000

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54323
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# JWT
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# Google AI (if using)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## Docker Commands

### Building

```bash
# Build only the frontend
docker build -t talk-to-my-lawyer-frontend .

# Build development image
docker build -f Dockerfile.dev -t talk-to-my-lawyer-frontend-dev .
```

### Running Individual Services

```bash
# Run only database
docker-compose up -d supabase

# Run only frontend
docker-compose up -d frontend

# Run with specific services
docker-compose up -d frontend supabase redis
```

### Debugging

```bash
# View container logs
docker-compose logs frontend
docker-compose logs supabase

# Execute commands in running container
docker-compose exec frontend sh
docker-compose exec supabase psql -U postgres

# Check container status
docker-compose ps

# Restart services
docker-compose restart frontend
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec supabase psql -U postgres

# Backup database
docker-compose exec supabase pg_dump -U postgres > backup.sql

# Restore database
docker-compose exec -T supabase psql -U postgres < backup.sql
```

## File Structure

```
talk-to-my-lawyer/
├── Dockerfile                 # Production frontend build
├── Dockerfile.dev            # Development frontend with hot reload
├── docker-compose.yml        # Production stack
├── docker-compose.dev.yml    # Development stack
├── .dockerignore             # Docker ignore patterns
├── nginx.conf                # Nginx configuration for production
├── docker-setup.md           # This documentation
└── ...
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose files if needed
2. **Permission issues**: Make sure Docker daemon is running
3. **Build failures**: Clear Docker cache with `docker system prune -a`

### Health Checks

```bash
# Check if services are healthy
docker-compose ps

# Test frontend health
curl http://localhost:3000/health

# Test database connection
docker-compose exec supabase pg_isready -U postgres
```

### Performance Optimization

- Use multi-stage builds (already implemented)
- Enable gzip compression (configured in nginx.conf)
- Use volume caching for node_modules in development
- Implement Redis caching for API responses

## Security Notes

1. Change default passwords in production
2. Use secrets management for sensitive data
3. Enable SSL/TLS for production deployment
4. Regularly update base images
5. Use non-root users in containers where possible