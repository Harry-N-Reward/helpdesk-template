# Database Schema Documentation

## Overview

The helpdesk system uses PostgreSQL as its database. Below are the database schemas, relationships, and setup instructions.

## Database Entities

### 1. Users Table

**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| role | ENUM | NOT NULL, CHECK | User role: 'end_user', 'it_user', 'it_admin' |
| department | VARCHAR(100) | NULL | User's department |
| phone | VARCHAR(20) | NULL | Contact phone number |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_users_email` on `email`
- `idx_users_role` on `role`

### 2. Tickets Table

**Table Name**: `tickets`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Ticket title/subject |
| description | TEXT | NOT NULL | Detailed description |
| category | ENUM | NOT NULL | 'hardware', 'software', 'network', 'access', 'other' |
| priority | ENUM | NOT NULL | 'low', 'medium', 'high', 'critical' |
| status | ENUM | DEFAULT 'open' | 'open', 'in_progress', 'resolved', 'closed' |
| requester_id | INTEGER | FOREIGN KEY, NOT NULL | References users.id |
| assigned_to | INTEGER | FOREIGN KEY, NULL | References users.id |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| closed_at | TIMESTAMP | NULL | Closure timestamp |

**Indexes**:
- `idx_tickets_requester` on `requester_id`
- `idx_tickets_assigned` on `assigned_to`
- `idx_tickets_status` on `status`
- `idx_tickets_category` on `category`
- `idx_tickets_created` on `created_at`

### 3. Ticket Updates Table

**Table Name**: `ticket_updates`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| ticket_id | INTEGER | FOREIGN KEY, NOT NULL | References tickets.id |
| updated_by | INTEGER | FOREIGN KEY, NOT NULL | References users.id |
| update_type | ENUM | NOT NULL | 'status_change', 'assignment', 'comment', 'priority_change' |
| old_value | VARCHAR(255) | NULL | Previous value |
| new_value | VARCHAR(255) | NULL | New value |
| comment | TEXT | NULL | Update comment/note |
| created_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes**:
- `idx_ticket_updates_ticket` on `ticket_id`
- `idx_ticket_updates_user` on `updated_by`
- `idx_ticket_updates_created` on `created_at`

### 4. Email Notifications Table

**Table Name**: `email_notifications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| ticket_id | INTEGER | FOREIGN KEY, NOT NULL | References tickets.id |
| recipient_email | VARCHAR(255) | NOT NULL | Email recipient |
| subject | VARCHAR(255) | NOT NULL | Email subject |
| body | TEXT | NOT NULL | Email body content |
| sent_at | TIMESTAMP | NULL | When email was sent |
| status | ENUM | DEFAULT 'pending' | 'pending', 'sent', 'failed' |
| error_message | TEXT | NULL | Error details if failed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes**:
- `idx_email_notifications_ticket` on `ticket_id`
- `idx_email_notifications_status` on `status`

## Entity Relationships

```
[Users] 1 ──── * [Tickets] (requester_id)
[Users] 1 ──── * [Tickets] (assigned_to)
[Users] 1 ──── * [Ticket Updates] (updated_by)
[Tickets] 1 ──── * [Ticket Updates] (ticket_id)
[Tickets] 1 ──── * [Email Notifications] (ticket_id)
```

## Database Setup SQL

### 1. Create Database

```sql
-- Create main database
CREATE DATABASE helpdesk_db;

-- Create test database
CREATE DATABASE helpdesk_test_db;

-- Connect to helpdesk_db
\c helpdesk_db;
```

### 2. Create ENUM Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('end_user', 'it_user', 'it_admin');

-- Ticket categories
CREATE TYPE ticket_category AS ENUM ('hardware', 'software', 'network', 'access', 'other');

-- Ticket priorities
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Ticket statuses
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Update types
CREATE TYPE update_type AS ENUM ('status_change', 'assignment', 'comment', 'priority_change');

-- Email statuses
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
```

### 3. Create Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ticket_category NOT NULL,
    priority ticket_priority NOT NULL,
    status ticket_status DEFAULT 'open',
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- Ticket updates table
CREATE TABLE ticket_updates (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    update_type update_type NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications table
CREATE TABLE email_notifications (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP,
    status email_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Create Indexes

```sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Tickets indexes
CREATE INDEX idx_tickets_requester ON tickets(requester_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_created ON tickets(created_at);

-- Ticket updates indexes
CREATE INDEX idx_ticket_updates_ticket ON ticket_updates(ticket_id);
CREATE INDEX idx_ticket_updates_user ON ticket_updates(updated_by);
CREATE INDEX idx_ticket_updates_created ON ticket_updates(created_at);

-- Email notifications indexes
CREATE INDEX idx_email_notifications_ticket ON email_notifications(ticket_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
```

### 5. Create Update Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. Sample Data

```sql
-- Insert sample users
INSERT INTO users (email, password, first_name, last_name, role, department) VALUES
('admin@company.com', '$2b$10$hashedpassword', 'Admin', 'User', 'it_admin', 'IT'),
('ituser@company.com', '$2b$10$hashedpassword', 'IT', 'Support', 'it_user', 'IT'),
('user1@company.com', '$2b$10$hashedpassword', 'John', 'Doe', 'end_user', 'Sales'),
('user2@company.com', '$2b$10$hashedpassword', 'Jane', 'Smith', 'end_user', 'Marketing');

-- Insert sample tickets
INSERT INTO tickets (title, description, category, priority, requester_id) VALUES
('Computer won''t start', 'My computer doesn''t turn on when I press the power button', 'hardware', 'high', 3),
('Cannot access email', 'I can''t log into my email account', 'software', 'medium', 4),
('Printer not working', 'The office printer is showing an error message', 'hardware', 'low', 3);
```

## Maintenance Commands

```sql
-- Vacuum and analyze for performance
VACUUM ANALYZE;

-- Check database size
SELECT pg_size_pretty(pg_database_size('helpdesk_db'));

-- View table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Backup and Restore

```bash
# Backup database
pg_dump helpdesk_db > helpdesk_backup.sql

# Restore database
psql helpdesk_db < helpdesk_backup.sql
```
