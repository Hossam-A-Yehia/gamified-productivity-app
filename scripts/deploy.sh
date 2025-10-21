#!/bin/bash

# Production Deployment Script for Gamified Productivity App
# Usage: ./scripts/deploy.sh [environment] [version]

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$PROJECT_DIR/.env.prod" ]; then
        log_error "Production environment file (.env.prod) not found."
        log_info "Please copy .env.prod.example to .env.prod and configure it."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_DIR"
    
    # Build backend image
    log_info "Building backend image..."
    docker build -f backend/Dockerfile.prod -t gamified-backend:$VERSION ./backend
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -f frontend/Dockerfile.prod -t gamified-frontend:$VERSION ./frontend
    
    log_success "Docker images built successfully"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production environment..."
    
    cd "$PROJECT_DIR"
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml --env-file .env.prod down || true
    
    # Pull latest images (if using registry)
    if [ "$VERSION" != "latest" ]; then
        log_info "Pulling images from registry..."
        docker-compose -f docker-compose.prod.yml --env-file .env.prod pull || log_warning "Could not pull images from registry"
    fi
    
    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    health_check
    
    log_success "Production deployment completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml --env-file .env.prod ps | grep -q "Up"; then
        log_error "Some containers are not running"
        docker-compose -f docker-compose.prod.yml --env-file .env.prod logs
        exit 1
    fi
    
    # Check backend health endpoint
    log_info "Checking backend health..."
    for i in {1..10}; do
        if curl -f http://localhost:5000/health &> /dev/null; then
            log_success "Backend is healthy"
            break
        fi
        if [ $i -eq 10 ]; then
            log_error "Backend health check failed"
            exit 1
        fi
        log_info "Waiting for backend... (attempt $i/10)"
        sleep 10
    done
    
    # Check frontend
    log_info "Checking frontend..."
    for i in {1..10}; do
        if curl -f http://localhost:80/health &> /dev/null; then
            log_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 10 ]; then
            log_error "Frontend health check failed"
            exit 1
        fi
        log_info "Waiting for frontend... (attempt $i/10)"
        sleep 10
    done
    
    log_success "All health checks passed"
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Get previous version from git
    PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "previous")
    
    log_info "Rolling back to version: $PREVIOUS_VERSION"
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml --env-file .env.prod down
    
    # Start with previous version
    VERSION=$PREVIOUS_VERSION deploy_production
    
    log_success "Rollback completed"
}

# Backup function
backup_data() {
    log_info "Creating backup..."
    
    BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database (if using local MongoDB)
    if docker-compose -f docker-compose.prod.yml --env-file .env.prod ps | grep -q "mongo"; then
        log_info "Backing up MongoDB..."
        docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T mongo mongodump --archive > "$BACKUP_DIR/mongodb_backup.archive"
    fi
    
    # Backup Redis (if using local Redis)
    if docker-compose -f docker-compose.prod.yml --env-file .env.prod ps | grep -q "redis"; then
        log_info "Backing up Redis..."
        docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T redis redis-cli BGSAVE
        docker cp $(docker-compose -f docker-compose.prod.yml --env-file .env.prod ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup.rdb"
    fi
    
    log_success "Backup created at: $BACKUP_DIR"
}

# Show logs
show_logs() {
    log_info "Showing application logs..."
    docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f
}

# Main deployment function
main() {
    log_info "Starting deployment process for environment: $ENVIRONMENT, version: $VERSION"
    
    case "$ENVIRONMENT" in
        "production"|"prod")
            check_prerequisites
            backup_data
            build_images
            deploy_production
            ;;
        "rollback")
            rollback
            ;;
        "logs")
            show_logs
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 [production|rollback|logs|health] [version]"
            echo ""
            echo "Commands:"
            echo "  production  - Deploy to production"
            echo "  rollback    - Rollback to previous version"
            echo "  logs        - Show application logs"
            echo "  health      - Perform health checks"
            echo ""
            echo "Examples:"
            echo "  $0 production v1.0.0"
            echo "  $0 rollback"
            echo "  $0 logs"
            exit 1
            ;;
    esac
    
    log_success "Deployment process completed successfully!"
}

# Trap errors and provide cleanup
trap 'log_error "Deployment failed! Check the logs above for details."' ERR

# Run main function
main "$@"
