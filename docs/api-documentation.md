# Helpdesk System API Documentation

## Overview

The Helpdesk System API provides a RESTful interface for managing IT support tickets, users, and authentication. The API is built with Node.js, Express, and PostgreSQL.

**Base URL:** `http://localhost:5000/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Endpoints

#### POST `/auth/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "end_user",
      "department": "Sales",
      "isActive": true
    }
  }
}
```

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "department": "Sales"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "end_user",
      "department": "Sales",
      "isActive": true
    }
  }
}
```

#### GET `/auth/profile`
Get the current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "end_user",
    "department": "Sales",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/auth/logout`
Logout the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Tickets

### GET `/tickets`
Get a list of tickets with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in title and description
- `status` (string): Filter by status (open, in_progress, resolved, closed)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `category` (string): Filter by category (hardware, software, network, access, other)
- `assignedTo` (number): Filter by assigned user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "title": "Login Issues",
        "description": "Cannot log into the system",
        "status": "open",
        "priority": "high",
        "category": "access",
        "createdBy": 1,
        "assignedTo": 2,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "User": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com"
        },
        "AssignedUser": {
          "id": 2,
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "it@example.com"
        }
      }
    ],
    "totalCount": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

### GET `/tickets/:id`
Get a specific ticket by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Login Issues",
    "description": "Cannot log into the system",
    "status": "open",
    "priority": "high",
    "category": "access",
    "createdBy": 1,
    "assignedTo": 2,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "User": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    },
    "AssignedUser": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "it@example.com"
    }
  }
}
```

### POST `/tickets`
Create a new ticket.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Printer Not Working",
  "description": "The office printer is not responding",
  "category": "hardware",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Printer Not Working",
    "description": "The office printer is not responding",
    "status": "open",
    "priority": "medium",
    "category": "hardware",
    "createdBy": 1,
    "assignedTo": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT `/tickets/:id`
Update an existing ticket.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "assignedTo": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "high",
    "category": "access",
    "createdBy": 1,
    "assignedTo": 2,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T01:00:00Z"
  }
}
```

### DELETE `/tickets/:id`
Delete a ticket (IT Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

### GET `/tickets/:id/updates`
Get updates/comments for a specific ticket.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticketId": 1,
      "comment": "Working on this issue",
      "createdBy": 2,
      "createdAt": "2024-01-01T01:00:00Z",
      "User": {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "it@example.com"
      }
    }
  ]
}
```

### POST `/tickets/:id/updates`
Add an update/comment to a ticket.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "comment": "Issue has been resolved"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "ticketId": 1,
    "comment": "Issue has been resolved",
    "createdBy": 2,
    "createdAt": "2024-01-01T02:00:00Z"
  }
}
```

### GET `/tickets/stats`
Get ticket statistics (IT Users only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTickets": 100,
    "openTickets": 25,
    "inProgressTickets": 30,
    "resolvedTickets": 35,
    "closedTickets": 10,
    "myAssignedTickets": 15
  }
}
```

## Users

### GET `/users`
Get a list of users (IT Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in name and email
- `role` (string): Filter by role (end_user, it_user, it_admin)
- `status` (string): Filter by status (active, inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "end_user",
        "department": "Sales",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### GET `/users/:id`
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "end_user",
    "department": "Sales",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT `/users/:id`
Update a user (IT Admin only, or own profile).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "department": "Marketing",
  "role": "end_user",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john.smith@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "end_user",
    "department": "Marketing",
    "isActive": true,
    "updatedAt": "2024-01-01T01:00:00Z"
  }
}
```

### DELETE `/users/:id`
Delete a user (IT Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### GET `/users/:id/stats`
Get statistics for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTickets": 10,
    "openTickets": 3,
    "closedTickets": 7,
    "assignedTickets": 5
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_EMAIL` - Email already exists
- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token has expired
- `RATE_LIMITED` - Too many requests

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per authenticated user
- **Public endpoints**: 20 requests per minute per IP

When rate limited, the API returns a `429` status code with retry information in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1609459200
Retry-After: 60
```

## Webhooks (Future Feature)

The API supports webhooks for real-time notifications:

- Ticket created
- Ticket updated
- Ticket assigned
- User created

Configure webhooks in the admin panel or via API endpoints (to be implemented).

## SDKs and Libraries

Official SDKs are available for:

- JavaScript/Node.js
- Python
- PHP
- C#

Community-maintained libraries are available for other languages.

## Support

For API support, please:

1. Check this documentation
2. Review the GitHub issues
3. Contact the development team
4. Submit a support ticket through the system

**API Version:** 1.0.0  
**Last Updated:** 2024-01-01
