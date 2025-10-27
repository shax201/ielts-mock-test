#!/bin/bash

# Production Deployment Script for IELTS Mock Test
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="docker.env"
BACKUP_DIR="./backups"

echo -e "${GREEN}🚀 Starting IELTS Mock Test Production Deployment${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Environment file $ENV_FILE not found${NC}"
    echo -e "${YELLOW}   Please copy docker.env.prod to docker.env and configure it${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p "$BACKUP_DIR"
mkdir -p "./ssl"
mkdir -p "./logs"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# Run database migration
echo -e "${YELLOW}🗄️  Running database migration...${NC}"
docker-compose -f "$COMPOSE_FILE" run --rm db-migrate

# Create initial backup
echo -e "${YELLOW}💾 Creating initial database backup...${NC}"
docker-compose -f "$COMPOSE_FILE" run --rm db-backup

# Show logs
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Service Status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${YELLOW}📊 To view logs:${NC}"
echo "  docker-compose -f $COMPOSE_FILE logs -f"

echo -e "${YELLOW}🛑 To stop services:${NC}"
echo "  docker-compose -f $COMPOSE_FILE down"

echo -e "${YELLOW}🔄 To restart services:${NC}"
echo "  docker-compose -f $COMPOSE_FILE restart"

echo -e "${GREEN}🎉 IELTS Mock Test is now running in production!${NC}"
