# IELTS Mock Test - Production Deployment Guide

This guide covers deploying the IELTS Mock Test application in a production environment using Docker Compose.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM and 2 CPU cores
- 20GB free disk space
- Domain name (for SSL certificates)

### 1. Environment Setup

```bash
# Copy the production environment template
cp docker.env.prod docker.env

# Edit the environment file with your production values
nano docker.env
```

**Required Environment Variables:**
- `POSTGRES_PASSWORD`: Strong password for PostgreSQL
- `REDIS_PASSWORD`: Strong password for Redis
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `JWT_SECRET`: Random secret for JWT tokens
- `NEXTAUTH_URL`: Your production domain (e.g., https://yourdomain.com)

### 2. Deploy to Production

```bash
# Make deployment script executable
chmod +x deploy-prod.sh

# Run the deployment
./deploy-prod.sh
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check application health
curl http://localhost/api/health
```

## 📊 Monitoring and Maintenance

### Using the Monitoring Script

```bash
# Interactive monitoring
./scripts/monitor-prod.sh

# Command-line monitoring
./scripts/monitor-prod.sh status    # Check service status
./scripts/monitor-prod.sh resources # Check resource usage
./scripts/monitor-prod.sh logs      # Check error logs
./scripts/monitor-prod.sh backup    # Create database backup
./scripts/monitor-prod.sh all       # Run all checks
```

### Manual Commands

```bash
# View service logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check resource usage
docker stats

# Create database backup
docker-compose -f docker-compose.prod.yml run --rm db-backup

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy and load balancer |
| app | 3000 (internal) | Next.js application |
| postgres | 5432 (internal) | PostgreSQL database |
| redis | 6379 (internal) | Redis cache and sessions |
| loki | 3100 (internal) | Log aggregation |

### Security Features

- **Network Isolation**: All services run in isolated Docker network
- **Port Binding**: Database and Redis only accessible from localhost
- **Read-only Filesystem**: Application runs with read-only root filesystem
- **Non-root User**: Application runs as non-privileged user
- **Resource Limits**: CPU and memory limits for all services
- **Health Checks**: Comprehensive health monitoring
- **Log Rotation**: Automatic log rotation and cleanup

### Backup Strategy

- **Automatic Backups**: Database backups created during deployment
- **Retention Policy**: Keeps 7 days of backups
- **Backup Location**: `./backups/` directory
- **Manual Backup**: Run `./scripts/monitor-prod.sh backup`

## 🛠️ Maintenance Tasks

### Daily Tasks

```bash
# Check service health
./scripts/monitor-prod.sh all

# Review error logs
./scripts/monitor-prod.sh logs
```

### Weekly Tasks

```bash
# Create fresh backup
./scripts/monitor-prod.sh backup

# Clean up old containers
./scripts/monitor-prod.sh cleanup

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Monthly Tasks

```bash
# Review resource usage trends
./scripts/monitor-prod.sh resources

# Check disk usage
./scripts/monitor-prod.sh disk

# Update base images
docker-compose -f docker-compose.prod.yml pull
```

## 🚨 Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

**Database Connection Issues:**
```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

**Application Errors:**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs app

# Check application health
curl http://localhost/api/health
```

### Performance Issues

**High Memory Usage:**
```bash
# Check memory usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

**Slow Response Times:**
```bash
# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Check Redis health
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## 📈 Scaling

### Horizontal Scaling

To scale the application:

```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Vertical Scaling

Update resource limits in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 4G      # Increase memory
      cpus: '4.0'     # Increase CPU
```

## 🔒 Security Considerations

1. **Change Default Passwords**: Update all default passwords in `docker.env`
2. **SSL Certificates**: Configure SSL certificates in `./ssl/` directory
3. **Firewall**: Configure firewall to only allow necessary ports
4. **Regular Updates**: Keep Docker images and dependencies updated
5. **Backup Security**: Secure backup files with proper permissions

## 📝 Logs

### Log Locations

- **Application Logs**: `docker-compose -f docker-compose.prod.yml logs app`
- **Nginx Logs**: `docker-compose -f docker-compose.prod.yml logs nginx`
- **Database Logs**: `docker-compose -f docker-compose.prod.yml logs postgres`
- **All Logs**: `docker-compose -f docker-compose.prod.yml logs`

### Log Rotation

Logs are automatically rotated with:
- Maximum size: 10MB per file
- Maximum files: 3-5 per service
- Automatic cleanup of old logs

## 🆘 Support

For issues and support:

1. Check the logs first
2. Run the monitoring script
3. Review this documentation
4. Check Docker and Docker Compose documentation

## 📋 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Health checks working
- [ ] Security measures in place
- [ ] Documentation updated
