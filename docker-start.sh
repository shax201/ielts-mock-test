#!/bin/bash

# IELTS Mock Test Docker Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Parse command line arguments
COMMAND=${1:-"up"}
ENVIRONMENT=${2:-"development"}

print_status "Starting IELTS Mock Test with Docker..."
print_status "Environment: $ENVIRONMENT"
print_status "Command: $COMMAND"

# Set environment file based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE="docker.env"
    COMPOSE_FILE="docker-compose.prod.yml"
    print_warning "Using production configuration"
else
    ENV_FILE="docker.env"
    COMPOSE_FILE="docker-compose.yml"
    print_status "Using development configuration"
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file $ENV_FILE not found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example "$ENV_FILE"
        print_status "Created $ENV_FILE from env.example. Please update the values."
    else
        print_error "No environment template found. Please create $ENV_FILE manually."
        exit 1
    fi
fi

# Function to start services
start_services() {
    print_status "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_status "Services started successfully!"
        print_status "Application: http://localhost:3000"
        print_status "Database: localhost:5432"
        print_status "Redis: localhost:6379"
        
        # Show logs
        print_status "Showing recent logs..."
        docker-compose -f "$COMPOSE_FILE" logs --tail=20
    else
        print_error "Some services failed to start. Check logs with:"
        print_error "docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose -f "$COMPOSE_FILE" down
    print_status "Services stopped."
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose -f "$COMPOSE_FILE" restart
    print_status "Services restarted."
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Function to clean up
cleanup() {
    print_status "Cleaning up containers and volumes..."
    docker-compose -f "$COMPOSE_FILE" down -v
    docker system prune -f
    print_status "Cleanup completed."
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" exec app npx prisma migrate deploy
    print_status "Migrations completed."
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."
    docker-compose -f "$COMPOSE_FILE" exec app npx prisma db seed
    print_status "Database seeded."
}

# Main command handling
case $COMMAND in
    "up"|"start")
        start_services
        ;;
    "down"|"stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "help")
        echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
        echo ""
        echo "Commands:"
        echo "  up, start    Start services (default)"
        echo "  down, stop   Stop services"
        echo "  restart      Restart services"
        echo "  logs         Show logs"
        echo "  status       Show service status"
        echo "  cleanup      Stop services and clean up volumes"
        echo "  migrate      Run database migrations"
        echo "  seed         Seed the database"
        echo "  help         Show this help message"
        echo ""
        echo "Environments:"
        echo "  development  Use development configuration (default)"
        echo "  production   Use production configuration"
        echo ""
        echo "Examples:"
        echo "  $0                    # Start development environment"
        echo "  $0 up production     # Start production environment"
        echo "  $0 logs              # Show logs"
        echo "  $0 cleanup           # Clean up everything"
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        print_status "Use '$0 help' for available commands"
        exit 1
        ;;
esac
