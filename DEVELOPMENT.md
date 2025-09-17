# Development Setup Guide

This guide will help you set up the IT Helpdesk System for local development.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **PostgreSQL** (if running without Docker)
- **Git**

## Quick Start with Docker (Recommended)

1. **Clone and Navigate to the Project**
   ```bash
   git clone <repository-url>
   cd helpdesk-template
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start Development Environment**
   ```bash
   ./start-dev.sh
   ```

   Or manually:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

## Manual Setup (Without Docker)

### 1. Database Setup

**Option A: Using Docker for Database Only**
```bash
docker run --name helpdesk-postgres \
  -e POSTGRES_DB=helpdesk_db \
  -e POSTGRES_USER=helpdesk_user \
  -e POSTGRES_PASSWORD=helpdesk_password \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local PostgreSQL Installation**
1. Install PostgreSQL
2. Create database and user:
   ```sql
   CREATE DATABASE helpdesk_db;
   CREATE USER helpdesk_user WITH PASSWORD 'helpdesk_password';
   GRANT ALL PRIVILEGES ON DATABASE helpdesk_db TO helpdesk_user;
   ```

### 2. Backend Setup

```bash
cd backend
npm install
npm run migrate  # Run database migrations
npm run seed     # Seed initial data
npm run dev      # Start development server
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start        # Start development server
```

## Environment Configuration

Edit the `.env` file with your specific configuration:

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=helpdesk_password
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=IT Support <support@company.com>
```

## Development Commands

### Backend Commands
```bash
npm run dev          # Start development server with hot reload
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run db:reset     # Reset and reseed database
```

### Frontend Commands
```bash
npm start            # Start development server
npm test             # Run tests
npm run test:coverage # Generate test coverage report
npm run build        # Build for production
```

### Docker Commands
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up --build -d
docker-compose down

# View logs
docker-compose logs -f

# Database operations in container
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage     # Generate coverage report
```

### Integration Testing
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run end-to-end tests (if configured)
npm run test:e2e
```

## Default Users

After seeding the database, you can log in with these default accounts:

### IT Admin
- **Email**: admin@company.com
- **Password**: admin123
- **Role**: IT Admin

### IT User
- **Email**: ituser@company.com
- **Password**: ituser123
- **Role**: IT User

### End User
- **Email**: user@company.com
- **Password**: user123
- **Role**: End User

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **Database GUI**: Use tools like pgAdmin or DBeaver to inspect the database
3. **API Testing**: Use Postman or Thunder Client to test API endpoints
4. **Logs**: Check container logs with `docker-compose logs -f`
5. **Reset Data**: Use `npm run db:reset` to reset and reseed the database

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Database Connection Issues**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists and user has permissions

**Docker Issues**
```bash
# Clean up Docker resources
docker system prune -f
docker-compose down -v  # Remove volumes
```

**Frontend Build Issues**
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Backend Migration Issues**
```bash
# Reset database and migrations
cd backend
npm run db:reset
```

## VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (for API testing)
- PostgreSQL (for database management)
- Docker
- GitLens

## Next Steps

1. Review the [API Documentation](./docs/api-documentation.md)
2. Check the [Deployment Guide](./docs/deployment-guide.md)
3. Customize the UI theme and branding
4. Configure email settings for notifications
5. Set up monitoring and logging for production
