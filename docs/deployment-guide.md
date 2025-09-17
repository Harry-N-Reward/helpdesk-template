# Helpdesk System Deployment Guide

This guide covers various deployment options for the Helpdesk System, from local development to production servers.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [SSL Configuration](#ssl-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd helpdesk-template
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   # In the backend directory
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. **Set up the database:**
   ```bash
   # Create database
   createdb helpdesk_dev
   
   # Run migrations and seed data
   cd backend
   npm run migrate
   npm run seed
   ```

6. **Start the development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

7. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Docker Deployment

### Development with Docker

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production with Docker

1. **Build and start production environment:**
   ```bash
   docker-compose up -d
   ```

2. **Initialize database (first time only):**
   ```bash
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

3. **Monitor services:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Production Deployment

### Option 1: VPS/Dedicated Server

#### Prerequisites

- Ubuntu 20.04+ or CentOS 8+
- Docker and Docker Compose
- Nginx (if not using Docker nginx)
- SSL certificate

#### Deployment Steps

1. **Server setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and configure:**
   ```bash
   git clone <repository-url> /opt/helpdesk
   cd /opt/helpdesk
   
   # Configure environment
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.yml --env-file .env.production up -d
   ```

### Option 2: Cloud Platforms

#### AWS ECS

1. **Create ECS cluster**
2. **Build and push images to ECR**
3. **Create task definitions**
4. **Set up load balancer**
5. **Configure RDS for PostgreSQL**

#### Google Cloud Run

1. **Build and push to Container Registry**
2. **Deploy services**
3. **Configure Cloud SQL**
4. **Set up load balancer**

#### Azure Container Instances

1. **Create resource group**
2. **Deploy container groups**
3. **Configure Azure Database for PostgreSQL**
4. **Set up Application Gateway**

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpdesk
DB_USER=helpdesk_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Helpdesk System <noreply@yourcompany.com>"

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# CORS
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_WEBSOCKET_URL=wss://api.your-domain.com
REACT_APP_ENVIRONMENT=production
```

## Database Setup

### PostgreSQL Configuration

1. **Create database and user:**
   ```sql
   CREATE DATABASE helpdesk;
   CREATE USER helpdesk_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE helpdesk TO helpdesk_user;
   ```

2. **Run migrations:**
   ```bash
   npm run migrate
   ```

3. **Seed initial data:**
   ```bash
   npm run seed
   ```

### Database Backup

```bash
# Backup
pg_dump -h localhost -U helpdesk_user helpdesk > backup.sql

# Restore
psql -h localhost -U helpdesk_user helpdesk < backup.sql
```

## SSL Configuration

### Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com -d api.your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Logging

### Application Monitoring

1. **Health Checks:**
   ```bash
   # Backend health
   curl https://api.your-domain.com/api/health
   
   # Frontend health
   curl https://your-domain.com
   ```

2. **Log Monitoring:**
   ```bash
   # Docker logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   
   # Application logs
   tail -f backend/logs/app.log
   ```

### External Monitoring

- **Uptime monitoring:** UptimeRobot, Pingdom
- **Performance monitoring:** New Relic, DataDog
- **Error tracking:** Sentry, Rollbar
- **Log aggregation:** ELK Stack, Splunk

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="helpdesk"

# Database backup
pg_dump -h localhost -U helpdesk_user $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/helpdesk

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Recovery Procedure

1. **Database recovery:**
   ```bash
   psql -h localhost -U helpdesk_user helpdesk < backup.sql
   ```

2. **Application recovery:**
   ```bash
   tar -xzf app_backup_YYYYMMDD_HHMMSS.tar.gz -C /
   ```

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check database credentials
   - Verify database service is running
   - Check network connectivity

2. **Frontend not loading:**
   - Check API URL configuration
   - Verify CORS settings
   - Check network policies

3. **Email not sending:**
   - Verify SMTP credentials
   - Check firewall rules
   - Test email configuration

4. **High memory usage:**
   - Monitor Docker container limits
   - Check for memory leaks
   - Optimize database queries

### Log Analysis

```bash
# Backend errors
grep -i error backend/logs/app.log

# Database connections
grep -i "database" backend/logs/app.log

# Authentication issues
grep -i "auth" backend/logs/app.log
```

### Performance Tuning

1. **Database optimization:**
   - Add database indexes
   - Optimize queries
   - Configure connection pooling

2. **Application optimization:**
   - Enable gzip compression
   - Implement caching
   - Optimize bundle size

3. **Server optimization:**
   - Tune Nginx configuration
   - Configure system limits
   - Monitor resource usage

## Security Checklist

- [ ] SSL/TLS encryption enabled
- [ ] Strong passwords and secrets
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular security updates
- [ ] Database access restricted
- [ ] Backup encryption enabled
- [ ] Monitoring and alerting active

## Maintenance

### Regular Tasks

1. **Daily:**
   - Monitor application health
   - Check error logs
   - Verify backup completion

2. **Weekly:**
   - Review performance metrics
   - Check disk space
   - Update dependencies (dev/staging)

3. **Monthly:**
   - Security updates
   - Performance optimization
   - Backup verification
   - Documentation updates

### Update Procedure

1. **Staging deployment:**
   ```bash
   git pull origin main
   docker-compose -f docker-compose.staging.yml up -d
   ```

2. **Testing:**
   - Run automated tests
   - Manual testing
   - Performance testing

3. **Production deployment:**
   ```bash
   # Backup current state
   ./backup.sh
   
   # Deploy updates
   git pull origin main
   docker-compose up -d
   ```

For additional support, please refer to the [API Documentation](api-documentation.md) and [Database Schema](database-schema.md).
