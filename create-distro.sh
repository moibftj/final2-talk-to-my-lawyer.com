#!/bin/bash

# talk-to-my-lawyer Distribution Creator
# This script creates a production-ready distribution of the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DISTRO_NAME="talk-to-my-lawyer-distro"
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DISTRO_DIR="dist/${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  talk-to-my-lawyer Distribution Creator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist/
mkdir -p "${DISTRO_DIR}"

# Build production application
echo -e "${YELLOW}🔨 Building production application...${NC}"
npm run build

# Create distribution structure
echo -e "${YELLOW}📦 Creating distribution package...${NC}"

# Copy essential files
cp -r dist-build/* "${DISTRO_DIR}/" 2>/dev/null || cp -r dist/* "${DISTRO_DIR}/" 2>/dev/null || echo "No dist folder found, will include source"
cp Dockerfile "${DISTRO_DIR}/"
cp docker-compose.yml "${DISTRO_DIR}/"
cp package.json "${DISTRO_DIR}/"
cp package-lock.json "${DISTRO_DIR}/" 2>/dev/null || echo "No package-lock.json found"
cp nginx.conf "${DISTRO_DIR}/" 2>/dev/null || echo "No nginx.conf found"

# Copy documentation
cp README.md "${DISTRO_DIR}/" 2>/dev/null || echo "No README.md found"
cp docker-setup.md "${DISTRO_DIR}/" 2>/dev/null || echo "No docker-setup.md found"

# Create deployment scripts
cat > "${DISTRO_DIR}/deploy.sh" << 'EOF'
#!/bin/bash

# Deployment script for talk-to-my-lawyer

set -e

echo "🚀 Deploying talk-to-my-lawyer..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'ENVEOF'
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
ENVEOF
    echo "⚠️  Please edit .env file with your actual configuration before running again."
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🔍 Running health checks..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Supabase Studio: http://localhost:54321"
    echo ""
    echo "📊 View logs with: docker-compose logs -f"
    echo "🛑 Stop with: docker-compose down"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi
EOF

# Create stop script
cat > "${DISTRO_DIR}/stop.sh" << 'EOF'
#!/bin/bash

echo "🛑 Stopping talk-to-my-lawyer services..."
docker-compose down

echo "✅ Services stopped successfully!"
EOF

# Create update script
cat > "${DISTRO_DIR}/update.sh" << 'EOF'
#!/bin/bash

echo "🔄 Updating talk-to-my-lawyer..."

# Pull latest images
docker-compose pull

# Rebuild and restart services
docker-compose up -d --build

echo "✅ Update completed!"
EOF

# Make scripts executable
chmod +x "${DISTRO_DIR}/deploy.sh"
chmod +x "${DISTRO_DIR}/stop.sh"
chmod +x "${DISTRO_DIR}/update.sh"

# Create installation guide
cat > "${DISTRO_DIR}/INSTALL.md" << 'EOF'
# talk-to-my-lawyer Installation Guide

## Prerequisites

1. **Docker & Docker Compose**: Install from https://docker.com
2. **At least 4GB RAM** available for containers
3. **Ports 3000, 54321-54325** should be available

## Quick Installation

1. **Extract this package** to your desired location
2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```
3. **Follow the prompts** to configure your environment
4. **Access your application** at http://localhost:3000

## Manual Installation

If the automatic script doesn't work:

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env** with your configuration

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

## Management Commands

- **Start**: `./deploy.sh` or `docker-compose up -d`
- **Stop**: `./stop.sh` or `docker-compose down`
- **Update**: `./update.sh`
- **View logs**: `docker-compose logs -f`
- **Restart**: `docker-compose restart`

## Troubleshooting

### Port Conflicts
If ports are in use, edit `docker-compose.yml` and change:
- `3000:80` to `YOUR_PORT:80` for frontend
- `54321:8000` to `YOUR_PORT:8000` for Supabase Studio

### Permission Issues
Make scripts executable:
```bash
chmod +x deploy.sh stop.sh update.sh
```

### Docker Issues
Reset Docker state:
```bash
docker-compose down
docker system prune -f
./deploy.sh
```

## Support

For issues and support, visit:
- GitHub: https://github.com/your-username/talk-to-my-lawyer
- Documentation: See docker-setup.md for detailed Docker configuration

## Configuration

The application requires several environment variables. The deployment script will create a template `.env` file that you need to configure with your actual values:

- **Supabase URL & Keys**: Get from your Supabase project dashboard
- **Database Password**: Use a strong password for production
- **JWT Secret**: Generate a secure random string (32+ characters)
- **Google AI API Key**: Get from Google AI Studio (if using AI features)
EOF

# Create version info
cat > "${DISTRO_DIR}/VERSION.txt" << EOF
talk-to-my-lawyer Distribution Package

Version: ${VERSION}
Build Date: $(date)
Build ID: ${TIMESTAMP}
Docker Images:
- Frontend: talk-to-my-lawyer-frontend:${VERSION}
- Base: node:18-alpine, nginx:alpine

Included Services:
- Frontend Application (React + Vite)
- Supabase (Database + Auth + API)
- Redis (Caching)
- Nginx (Reverse Proxy)

System Requirements:
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 2GB+ Disk Space
EOF

# Create archive
echo -e "${YELLOW}📦 Creating distribution archive...${NC}"
cd dist
tar -czf "${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}.tar.gz" "${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}/"
zip -r "${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}.zip" "${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}/" > /dev/null
cd ..

# Final output
echo ""
echo -e "${GREEN}✅ Distribution created successfully!${NC}"
echo ""
echo -e "${BLUE}📦 Package Information:${NC}"
echo -e "   Name: ${DISTRO_NAME}"
echo -e "   Version: ${VERSION}"
echo -e "   Build ID: ${TIMESTAMP}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo -e "   Directory: ${DISTRO_DIR}/"
echo -e "   Archive: dist/${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}.tar.gz"
echo -e "   ZIP: dist/${DISTRO_NAME}_v${VERSION}_${TIMESTAMP}.zip"
echo ""
echo -e "${BLUE}🚀 To deploy:${NC}"
echo -e "   1. Extract the archive on target system"
echo -e "   2. Run: ./deploy.sh"
echo -e "   3. Configure .env file when prompted"
echo -e "   4. Access at http://localhost:3000"
echo ""
echo -e "${GREEN}🎉 Ready for distribution!${NC}"