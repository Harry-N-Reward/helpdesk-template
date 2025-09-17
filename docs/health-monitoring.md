# System Health Check Guide

## Health Check Endpoints

The IT Helpdesk System includes several health check endpoints for monitoring system status.

### Backend Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "15ms"
    },
    "email": {
      "status": "healthy",
      "configured": true
    }
  },
  "system": {
    "memory": {
      "used": "120MB",
      "total": "512MB",
      "percentage": 23.4
    },
    "cpu": {
      "usage": "15%"
    }
  }
}
```

### Database Health Check

**Endpoint:** `GET /api/health/database`

Tests database connectivity and basic operations.

### Email Service Health Check

**Endpoint:** `GET /api/health/email`

Verifies email service configuration and connectivity.

## Container Health Checks

### Docker Health Check Script

The backend includes a health check script at `/backend/scripts/healthcheck.js` that:

1. Tests database connectivity
2. Verifies API responsiveness
3. Checks memory usage
4. Validates environment configuration

### Docker Compose Health Checks

Both `docker-compose.yml` and `docker-compose.dev.yml` include health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "scripts/healthcheck.js"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Monitoring Commands

### Check Service Status
```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps backend

# View health status
docker-compose exec backend node scripts/healthcheck.js
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage
```bash
# Container resource usage
docker stats

# Detailed container info
docker-compose exec backend node -e "
console.log('Memory Usage:', process.memoryUsage());
console.log('Uptime:', process.uptime(), 'seconds');
"
```

## Troubleshooting Health Issues

### Database Connection Issues
```bash
# Test database connection
docker-compose exec backend node -e "
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));
"
```

### Memory Issues
```bash
# Check memory usage
docker-compose exec backend node -e "
const used = process.memoryUsage();
for (let key in used) {
  console.log(\`\${key}: \${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\`);
}
"
```

### Performance Monitoring
```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:5000/api/health"

# Where curl-format.txt contains:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

## Alerts and Notifications

### Health Check Failures

When health checks fail, check:

1. **Database connectivity**
2. **Memory usage**
3. **Disk space**
4. **Network connectivity**
5. **Environment variables**

### Log Monitoring

Monitor these log patterns for issues:

- `ERROR:` - Application errors
- `Database connection error` - Database issues
- `ECONNREFUSED` - Service connectivity issues
- `Out of memory` - Memory issues
- `Rate limit exceeded` - Too many requests

### Email Service Issues

Common email service problems:

1. **Invalid credentials** - Check EMAIL_USER and EMAIL_PASSWORD
2. **SMTP settings** - Verify EMAIL_HOST and EMAIL_PORT
3. **Firewall/Security** - Check if SMTP ports are blocked
4. **App passwords** - Use app-specific passwords for Gmail

## Production Monitoring

For production environments, consider implementing:

1. **External monitoring** (Uptimerobot, Pingdom)
2. **Log aggregation** (ELK stack, Grafana)
3. **Performance monitoring** (New Relic, DataDog)
4. **Error tracking** (Sentry, Rollbar)
5. **Infrastructure monitoring** (Prometheus, Nagios)

## Health Check Automation

### Automated Testing Script
```bash
#!/bin/bash
# Simple health check automation

BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

# Check backend health
if curl -f -s "$BACKEND_URL/api/health" > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

echo "🎉 All services are healthy"
```

Save this as `health-check.sh` and run periodically or in CI/CD pipelines.
