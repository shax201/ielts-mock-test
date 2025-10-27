# Docker Setup for IELTS Mock Test

This document provides instructions for setting up and running the IELTS Mock Test application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd ielts-mock-test
   ```

2. **Configure environment variables**:
   - Copy `env.example` to `.env` and update the values
   - Or use the provided `docker.env` file for Docker-specific configuration

3. **Build and start the services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Application: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Services

The Docker setup includes the following services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: ielts_mock_test
- **User**: ielts_user
- **Password**: ielts_password

### 2. Redis Cache (`redis`)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Purpose**: Caching and session storage

### 3. Next.js Application (`app`)
- **Port**: 3000
- **Environment**: Production
- **Features**: Auto-scaling, health checks

### 4. Database Migration Service (`db-migrate`)
- **Purpose**: Runs Prisma migrations and seeds the database
- **Runs**: Once on startup

## Environment Variables

### Required Variables

```env
DATABASE_URL="postgresql://ielts_user:ielts_password@postgres:5432/ielts_mock_test"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
NODE_ENV="production"
```

### Optional Variables

```env
# Redis
REDIS_URL="redis://redis:6379"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# AWS S3 (alternative to Cloudinary)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Email (Resend)
RESEND_API_KEY="re_********************************"
EMAIL_FROM="IELTS Mock Test <noreply@yourdomain.com>"
RESEND_BASE_URL="https://api.resend.com"
```

## Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Build and start services
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Commands

```bash
# View logs
docker-compose logs

# View logs for specific service
docker-compose logs app

# Follow logs
docker-compose logs -f app

# Execute commands in running container
docker-compose exec app sh

# Run database migrations manually
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npx prisma db seed
```

### Database Commands

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U ielts_user -d ielts_mock_test

# Backup database
docker-compose exec postgres pg_dump -U ielts_user ielts_mock_test > backup.sql

# Restore database
docker-compose exec -T postgres psql -U ielts_user -d ielts_mock_test < backup.sql
```

## File Structure

```
├── Dockerfile              # Main application container
├── docker-compose.yml      # Multi-container setup
├── .dockerignore          # Files to ignore in Docker build
├── docker.env             # Docker-specific environment variables
├── init-db.sql            # Database initialization script
└── DOCKER_SETUP.md        # This documentation
```

## Production Deployment

### Security Considerations

1. **Change default passwords**:
   - Update PostgreSQL password
   - Update JWT secrets
   - Update NextAuth secret

2. **Use environment files**:
   ```bash
   docker-compose --env-file .env.production up
   ```

3. **Enable SSL/TLS**:
   - Use a reverse proxy (nginx, traefik)
   - Configure SSL certificates

4. **Resource limits**:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

### Scaling

```bash
# Scale the application
docker-compose up --scale app=3

# Use load balancer
# Configure nginx or traefik for load balancing
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5432
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec app npx prisma db pull
   ```

3. **Build failures**:
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Check build logs
   docker-compose build app
   ```

4. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f --tail=100 app
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Check application health
curl http://localhost:3000/api/health

# Check database connection
docker-compose exec app npx prisma db pull
```

## Development vs Production

### Development
- Uses `docker-compose.yml`
- Includes development tools
- Hot reloading (if configured)
- Debug logging enabled

### Production
- Use `docker-compose.prod.yml` (create if needed)
- Optimized for performance
- Security hardening
- Monitoring and logging

## Monitoring

### Container Stats
```bash
# View resource usage
docker stats

# View specific container stats
docker stats ielts-app
```

### Application Monitoring
- Use tools like Prometheus + Grafana
- Configure health check endpoints
- Set up alerting

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U ielts_user ielts_mock_test > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T postgres psql -U ielts_user -d ielts_mock_test < backup_file.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v ielts-mock-test_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Support

For issues related to Docker setup:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check port availability
4. Review this documentation

For application-specific issues, refer to the main README.md file.
