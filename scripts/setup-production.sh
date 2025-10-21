#!/bin/bash

# Production Server Setup Script
# This script sets up a fresh server for the Gamified Productivity App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Update system packages
update_system() {
    log_info "Updating system packages..."
    
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get install -y curl wget git unzip software-properties-common
    
    log_success "System packages updated"
}

# Install Docker
install_docker() {
    log_info "Installing Docker..."
    
    # Remove old versions
    sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    log_success "Docker installed successfully"
    log_warning "Please log out and log back in for Docker group changes to take effect"
}

# Install Node.js (for local development/debugging)
install_nodejs() {
    log_info "Installing Node.js..."
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    log_success "Node.js $(node --version) installed"
}

# Install Nginx (for reverse proxy)
install_nginx() {
    log_info "Installing Nginx..."
    
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Configure firewall
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    sudo ufw --force enable
    
    log_success "Nginx installed and configured"
}

# Install Certbot for SSL certificates
install_certbot() {
    log_info "Installing Certbot for SSL certificates..."
    
    sudo apt-get install -y certbot python3-certbot-nginx
    
    log_success "Certbot installed"
}

# Install monitoring tools
install_monitoring() {
    log_info "Installing monitoring tools..."
    
    # Install htop, iotop, and other monitoring tools
    sudo apt-get install -y htop iotop nethogs ncdu tree
    
    # Install Docker monitoring
    docker pull prom/prometheus
    docker pull grafana/grafana
    
    log_success "Monitoring tools installed"
}

# Setup firewall
setup_firewall() {
    log_info "Setting up firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow application ports (if needed for direct access)
    # sudo ufw allow 5000/tcp  # Backend API
    # sudo ufw allow 5173/tcp  # Frontend dev server
    
    # Enable firewall
    sudo ufw --force enable
    
    log_success "Firewall configured"
}

# Create application user
create_app_user() {
    log_info "Creating application user..."
    
    # Create user for running the application
    sudo useradd -m -s /bin/bash -G docker gamified-app || true
    
    # Create application directory
    sudo mkdir -p /opt/gamified-app
    sudo chown gamified-app:gamified-app /opt/gamified-app
    
    # Create log directory
    sudo mkdir -p /var/log/gamified-app
    sudo chown gamified-app:gamified-app /var/log/gamified-app
    
    log_success "Application user created"
}

# Setup log rotation
setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/gamified-app > /dev/null <<EOF
/var/log/gamified-app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 gamified-app gamified-app
    postrotate
        docker-compose -f /opt/gamified-app/docker-compose.prod.yml restart backend || true
    endscript
}
EOF
    
    log_success "Log rotation configured"
}

# Setup systemd service
setup_systemd_service() {
    log_info "Setting up systemd service..."
    
    sudo tee /etc/systemd/system/gamified-app.service > /dev/null <<EOF
[Unit]
Description=Gamified Productivity App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/gamified-app
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=gamified-app
Group=gamified-app

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable gamified-app
    
    log_success "Systemd service configured"
}

# Setup backup script
setup_backup_script() {
    log_info "Setting up backup script..."
    
    sudo tee /opt/gamified-app/backup.sh > /dev/null <<'EOF'
#!/bin/bash

# Backup script for Gamified Productivity App
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/gamified-app/$DATE"
APP_DIR="/opt/gamified-app"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup application data
cd "$APP_DIR"

# Backup environment files
cp .env.prod "$BACKUP_DIR/"

# Backup database (if using local MongoDB)
if docker-compose -f docker-compose.prod.yml ps | grep -q mongo; then
    docker-compose -f docker-compose.prod.yml exec -T mongo mongodump --archive > "$BACKUP_DIR/mongodb_backup.archive"
fi

# Backup Redis (if using local Redis)
if docker-compose -f docker-compose.prod.yml ps | grep -q redis; then
    docker-compose -f docker-compose.prod.yml exec -T redis redis-cli BGSAVE
    docker cp $(docker-compose -f docker-compose.prod.yml ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup.rdb"
fi

# Compress backup
tar -czf "/opt/backups/gamified-app/backup_$DATE.tar.gz" -C "/opt/backups/gamified-app" "$DATE"
rm -rf "$BACKUP_DIR"

# Keep only last 7 days of backups
find /opt/backups/gamified-app -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
EOF
    
    sudo chmod +x /opt/gamified-app/backup.sh
    sudo chown gamified-app:gamified-app /opt/gamified-app/backup.sh
    
    # Create backup directory
    sudo mkdir -p /opt/backups/gamified-app
    sudo chown gamified-app:gamified-app /opt/backups/gamified-app
    
    # Setup cron job for daily backups
    (sudo crontab -u gamified-app -l 2>/dev/null; echo "0 2 * * * /opt/gamified-app/backup.sh") | sudo crontab -u gamified-app -
    
    log_success "Backup script configured"
}

# Configure Nginx reverse proxy
configure_nginx() {
    local domain=${1:-localhost}
    
    log_info "Configuring Nginx reverse proxy for domain: $domain"
    
    sudo tee /etc/nginx/sites-available/gamified-app > /dev/null <<EOF
server {
    listen 80;
    server_name $domain;

    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    # return 301 https://\$server_name\$request_uri;

    # Temporary HTTP configuration
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/gamified-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    log_success "Nginx configured for domain: $domain"
}

# Main setup function
main() {
    local domain=${1:-localhost}
    
    log_info "Starting production server setup..."
    log_info "Domain: $domain"
    
    update_system
    install_docker
    install_nodejs
    install_nginx
    install_certbot
    install_monitoring
    setup_firewall
    create_app_user
    setup_log_rotation
    setup_systemd_service
    setup_backup_script
    configure_nginx "$domain"
    
    log_success "Production server setup completed!"
    log_info "Next steps:"
    echo "1. Clone your repository to /opt/gamified-app"
    echo "2. Configure .env.prod file"
    echo "3. Run SSL certificate setup: sudo certbot --nginx -d $domain"
    echo "4. Start the application: sudo systemctl start gamified-app"
    echo "5. Check status: sudo systemctl status gamified-app"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Run main function
main "$@"
