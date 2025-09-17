# IT Helpdesk System

A comprehensive web-based helpdesk system for IT support ticket management.

## Features

### User Types
- **End Users**: Can create, view, and track their own tickets
- **IT Users**: Can view all tickets, assign tickets to themselves, update ticket status, and communicate with users
- **IT Admins**: Can perform all IT user functions plus delete tickets and assign tickets to any IT user

### Core Functionality
- User authentication and authorization
- Ticket creation with categorization
- Real-time ticket status updates
- Email notifications for ticket updates
- User-friendly dashboard for each user type
- Comprehensive ticket history and tracking

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database
- **Sequelize** ORM for database management
- **JWT** for authentication
- **Nodemailer** for email notifications
- **bcrypt** for password hashing
- **Express Validator** for input validation

### Frontend
- **React** with functional components and hooks
- **Material-UI** for modern, responsive design
- **Axios** for API communication
- **React Router** for navigation
- **Context API** for state management

### Testing
- **Jest** for unit testing
- **Supertest** for API testing
- **React Testing Library** for frontend testing
- **Database seeding** for test data

## Project Structure

```
helpdesk-template/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   └── users.js
│   ├── services/
│   │   └── emailService.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── tickets.test.js
│   │   └── users.test.js
│   ├── utils/
│   │   └── helpers.js
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   └── common/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docs/
│   ├── database-schema.md
│   └── api-documentation.md
├── .env.example
├── .gitignore
├── docker-compose.yml
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (if not using Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helpdesk-template
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   ./start-dev.sh
   ```
   
   Or manually:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Local Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed local setup instructions.

## 🔐 Default Login Credentials

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| IT Admin | admin@company.com | admin123 |
| IT User | ituser@company.com | ituser123 |
| End User | user@company.com | user123 |

## 📚 Documentation

- **[Development Setup](./DEVELOPMENT.md)** - Local development guide
- **[API Documentation](./docs/api-documentation.md)** - Complete API reference
- **[Database Schema](./docs/database-schema.md)** - Database structure
- **[Deployment Guide](./docs/deployment-guide.md)** - Production deployment

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# With Docker
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## 📊 Features Overview

### For End Users
- ✅ Create and submit support tickets
- ✅ Track ticket status and updates
- ✅ View ticket history
- ✅ Receive email notifications
- ✅ Update profile information

### For IT Users
- ✅ View and manage all tickets
- ✅ Assign tickets to themselves
- ✅ Update ticket status and add comments
- ✅ Filter and search tickets
- ✅ Dashboard with statistics

### For IT Admins
- ✅ All IT user capabilities
- ✅ User management (create, edit, delete)
- ✅ Assign tickets to any IT user
- ✅ Delete tickets
- ✅ System administration

## 🐳 Docker Support

The application includes comprehensive Docker support:

- **Development**: Hot-reload enabled containers
- **Production**: Optimized multi-stage builds
- **Database**: PostgreSQL container with persistent data
- **Health Checks**: Built-in container health monitoring

## 🔧 Configuration

Key configuration options in `.env`:

```env
# Database
DB_HOST=localhost
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=helpdesk_password

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-app-password
```

## 🚀 Production Deployment

```bash
# Production deployment
./start-prod.sh

# Or manually
docker-compose up -d --build
```

For detailed production setup, see [Deployment Guide](./docs/deployment-guide.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Development Guide](./DEVELOPMENT.md)
- Review [API Documentation](./docs/api-documentation.md)
- Open an issue on GitHub

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helpdesk-template
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb helpdesk_db
   createdb helpdesk_test_db
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

5. **Database Migration**
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

### Default Users

After seeding, you'll have these default users:

- **IT Admin**: admin@company.com / password123
- **IT User**: ituser@company.com / password123
- **End User**: user@company.com / password123

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

Detailed API documentation is available in `docs/api-documentation.md`.

## Database Schema

Database schema and relationships are documented in `docs/database-schema.md`.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:auth
npm run test:tickets
npm run test:users
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts server with nodemon
```

### Frontend Development
```bash
cd frontend
npm start  # Starts React development server
```

## Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
