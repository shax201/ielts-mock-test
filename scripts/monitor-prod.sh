#!/bin/bash

# Production Monitoring and Maintenance Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="../docker-compose.prod.yml"

echo -e "${BLUE}🔍 IELTS Mock Test Production Monitoring${NC}"
echo "================================================"

# Function to check service status
check_services() {
    echo -e "${YELLOW}📊 Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
}

# Function to check resource usage
check_resources() {
    echo -e "${YELLOW}💻 Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    echo ""
}

# Function to check disk usage
check_disk() {
    echo -e "${YELLOW}💾 Disk Usage:${NC}"
    df -h
    echo ""
    
    echo -e "${YELLOW}📁 Docker Volume Usage:${NC}"
    docker system df
    echo ""
}

# Function to check logs for errors
check_logs() {
    echo -e "${YELLOW}📋 Recent Error Logs:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 | grep -i error || echo "No recent errors found"
    echo ""
}

# Function to check database health
check_database() {
    echo -e "${YELLOW}🗄️  Database Health:${NC}"
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U ielts_user -d ielts_mock_test || echo "Database is not ready"
    echo ""
}

# Function to check Redis health
check_redis() {
    echo -e "${YELLOW}🔴 Redis Health:${NC}"
    docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping || echo "Redis is not responding"
    echo ""
}

# Function to check application health
check_app() {
    echo -e "${YELLOW}🌐 Application Health:${NC}"
    curl -f http://localhost/api/health 2>/dev/null && echo "Application is healthy" || echo "Application health check failed"
    echo ""
}

# Function to clean up old containers and images
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up old containers and images...${NC}"
    docker system prune -f
    docker image prune -f
    echo "Cleanup completed"
    echo ""
}

# Function to backup database
backup_database() {
    echo -e "${YELLOW}💾 Creating database backup...${NC}"
    docker-compose -f "$COMPOSE_FILE" run --rm db-backup
    echo "Backup completed"
    echo ""
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    docker-compose -f "$COMPOSE_FILE" restart
    echo "Services restarted"
    echo ""
}

# Function to update services
update_services() {
    echo -e "${YELLOW}🔄 Updating services...${NC}"
    docker-compose -f "$COMPOSE_FILE" pull
    docker-compose -f "$COMPOSE_FILE" up -d
    echo "Services updated"
    echo ""
}

# Main menu
show_menu() {
    echo -e "${GREEN}Select an option:${NC}"
    echo "1. Check service status"
    echo "2. Check resource usage"
    echo "3. Check disk usage"
    echo "4. Check error logs"
    echo "5. Check database health"
    echo "6. Check Redis health"
    echo "7. Check application health"
    echo "8. Clean up old containers/images"
    echo "9. Backup database"
    echo "10. Restart services"
    echo "11. Update services"
    echo "12. Run all checks"
    echo "0. Exit"
    echo ""
}

# Run all checks
run_all_checks() {
    check_services
    check_resources
    check_disk
    check_logs
    check_database
    check_redis
    check_app
}

# Main script
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Enter your choice: " choice
        case $choice in
            1) check_services ;;
            2) check_resources ;;
            3) check_disk ;;
            4) check_logs ;;
            5) check_database ;;
            6) check_redis ;;
            7) check_app ;;
            8) cleanup ;;
            9) backup_database ;;
            10) restart_services ;;
            11) update_services ;;
            12) run_all_checks ;;
            0) echo "Goodbye!"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
else
    # Command line mode
    case $1 in
        status) check_services ;;
        resources) check_resources ;;
        disk) check_disk ;;
        logs) check_logs ;;
        db) check_database ;;
        redis) check_redis ;;
        app) check_app ;;
        cleanup) cleanup ;;
        backup) backup_database ;;
        restart) restart_services ;;
        update) update_services ;;
        all) run_all_checks ;;
        *) echo "Usage: $0 [status|resources|disk|logs|db|redis|app|cleanup|backup|restart|update|all]" ;;
    esac
fi
