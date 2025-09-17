const request = require('supertest');
const { app } = require('../app');
const { User, Ticket } = require('../models');

describe('Ticket Endpoints', () => {
  let endUserToken, itUserToken, itAdminToken;
  let endUser, itUser, itAdmin;
  let testTicket;

  beforeEach(async () => {
    // Create test users
    endUser = await User.create({
      email: 'enduser@example.com',
      password: 'Password123',
      firstName: 'End',
      lastName: 'User',
      role: 'end_user',
    });

    itUser = await User.create({
      email: 'ituser@example.com',
      password: 'Password123',
      firstName: 'IT',
      lastName: 'User',
      role: 'it_user',
    });

    itAdmin = await User.create({
      email: 'itadmin@example.com',
      password: 'Password123',
      firstName: 'IT',
      lastName: 'Admin',
      role: 'it_admin',
    });

    // Get authentication tokens
    const endUserLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'enduser@example.com', password: 'Password123' });
    endUserToken = endUserLogin.body.data.token;

    const itUserLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ituser@example.com', password: 'Password123' });
    itUserToken = itUserLogin.body.data.token;

    const itAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'itadmin@example.com', password: 'Password123' });
    itAdminToken = itAdminLogin.body.data.token;

    // Create test ticket
    testTicket = await Ticket.create({
      title: 'Test Ticket',
      description: 'This is a test ticket for testing purposes',
      category: 'software',
      priority: 'medium',
      requesterId: endUser.id,
    });
  });

  describe('POST /api/tickets', () => {
    test('should create ticket successfully as end user', async () => {
      const ticketData = {
        title: 'New Test Ticket',
        description: 'This is a new test ticket with sufficient description length',
        category: 'hardware',
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.title).toBe(ticketData.title);
      expect(response.body.data.ticket.requesterId).toBe(endUser.id);
      expect(response.body.data.ticket.status).toBe('open');
    });

    test('should fail without authentication', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        category: 'software',
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(ticketData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid data', async () => {
      const ticketData = {
        title: 'Ab', // Too short
        description: 'Short', // Too short
        category: 'invalid', // Invalid category
      };

      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(ticketData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tickets', () => {
    test('should get tickets for end user (only their own)', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets).toHaveLength(1);
      expect(response.body.data.tickets[0].requesterId).toBe(endUser.id);
    });

    test('should get all tickets for IT user', async () => {
      // Create another ticket from different user
      await Ticket.create({
        title: 'Another Ticket',
        description: 'This is another test ticket',
        category: 'network',
        priority: 'low',
        requesterId: itUser.id,
      });

      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets.length).toBeGreaterThan(1);
    });

    test('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/tickets?status=open')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.tickets.forEach(ticket => {
        expect(ticket.status).toBe('open');
      });
    });

    test('should paginate tickets', async () => {
      const response = await request(app)
        .get('/api/tickets?page=1&limit=1')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });
  });

  describe('GET /api/tickets/:id', () => {
    test('should get ticket by ID for owner', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.id).toBe(testTicket.id);
    });

    test('should get ticket by ID for IT user', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.id).toBe(testTicket.id);
    });

    test('should fail for non-owner end user', async () => {
      // Create another end user
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'Password123',
        firstName: 'Another',
        lastName: 'User',
        role: 'end_user',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'another@example.com', password: 'Password123' });

      const response = await request(app)
        .get(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/tickets/99999')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tickets/:id', () => {
    test('should update ticket as IT user', async () => {
      const updateData = {
        status: 'in_progress',
        priority: 'high',
      };

      const response = await request(app)
        .put(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.status).toBe('in_progress');
      expect(response.body.data.ticket.priority).toBe('high');
    });

    test('should allow end user to update own open ticket', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description with sufficient length for validation',
      };

      const response = await request(app)
        .put(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.title).toBe(updateData.title);
    });

    test('should prevent end user from changing status', async () => {
      const updateData = {
        status: 'closed',
      };

      const response = await request(app)
        .put(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Status should remain unchanged
      expect(response.body.data.ticket.status).toBe('open');
    });
  });

  describe('POST /api/tickets/:id/comments', () => {
    test('should add comment to ticket', async () => {
      const commentData = {
        comment: 'This is a test comment',
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/comments`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.update.comment).toBe(commentData.comment);
      expect(response.body.data.update.updateType).toBe('comment');
    });

    test('should fail with empty comment', async () => {
      const commentData = {
        comment: '',
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/comments`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tickets/:id/assign', () => {
    test('should assign ticket as IT admin', async () => {
      const assignData = {
        assignedTo: itUser.id,
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/assign`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .send(assignData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.assignedTo).toBe(itUser.id);
    });

    test('should allow IT user to assign to themselves', async () => {
      const assignData = {
        assignedTo: itUser.id,
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/assign`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .send(assignData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.assignedTo).toBe(itUser.id);
    });

    test('should prevent IT user from assigning to others', async () => {
      const assignData = {
        assignedTo: itAdmin.id,
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/assign`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .send(assignData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for end users', async () => {
      const assignData = {
        assignedTo: itUser.id,
      };

      const response = await request(app)
        .post(`/api/tickets/${testTicket.id}/assign`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .send(assignData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    test('should delete ticket as IT admin', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should fail for IT user', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTicket.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tickets/stats/overview', () => {
    test('should get ticket statistics for IT user', async () => {
      const response = await request(app)
        .get('/api/tickets/stats/overview')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('total');
      expect(response.body.data.stats).toHaveProperty('open');
      expect(response.body.data.stats).toHaveProperty('inProgress');
      expect(response.body.data.stats).toHaveProperty('resolved');
      expect(response.body.data.stats).toHaveProperty('closed');
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .get('/api/tickets/stats/overview')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
