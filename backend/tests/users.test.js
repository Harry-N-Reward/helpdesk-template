const request = require('supertest');
const { app } = require('../app');
const { User } = require('../models');

describe('User Endpoints', () => {
  let endUserToken, itUserToken, itAdminToken;
  let endUser, itUser, itAdmin;

  beforeEach(async () => {
    // Create test users
    endUser = await User.create({
      email: 'enduser@example.com',
      password: 'Password123',
      firstName: 'End',
      lastName: 'User',
      role: 'end_user',
      department: 'Sales',
    });

    itUser = await User.create({
      email: 'ituser@example.com',
      password: 'Password123',
      firstName: 'IT',
      lastName: 'User',
      role: 'it_user',
      department: 'IT',
    });

    itAdmin = await User.create({
      email: 'itadmin@example.com',
      password: 'Password123',
      firstName: 'IT',
      lastName: 'Admin',
      role: 'it_admin',
      department: 'IT',
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
  });

  describe('GET /api/users', () => {
    test('should get all users for IT user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should get all users for IT admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users?role=it_user')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.users.forEach(user => {
        expect(user.role).toBe('it_user');
      });
    });

    test('should search users by name', async () => {
      const response = await request(app)
        .get('/api/users?search=End')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    test('should paginate users', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });
  });

  describe('GET /api/users/it-users', () => {
    test('should get IT users for IT staff', async () => {
      const response = await request(app)
        .get('/api/users/it-users')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.users.forEach(user => {
        expect(['it_user', 'it_admin']).toContain(user.role);
      });
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .get('/api/users/it-users')
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should get user by ID for IT staff', async () => {
      const response = await request(app)
        .get(`/api/users/${endUser.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(endUser.id);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .get(`/api/users/${itUser.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    test('should create user as IT admin', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: 'end_user',
        department: 'Marketing',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${itAdminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should fail for IT user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: 'end_user',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${itUserToken}`)
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        email: 'enduser@example.com', // Already exists
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: 'end_user',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${itAdminToken}`)
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user as IT admin', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        department: 'Updated Department',
        role: 'it_user',
      };

      const response = await request(app)
        .put(`/api/users/${endUser.id}`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.role).toBe(updateData.role);
    });

    test('should fail for IT user', async () => {
      const updateData = {
        firstName: 'Updated',
      };

      const response = await request(app)
        .put(`/api/users/${endUser.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for non-existent user', async () => {
      const updateData = {
        firstName: 'Updated',
      };

      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${itAdminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id/deactivate', () => {
    test('should deactivate user as IT admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${endUser.id}/deactivate`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.isActive).toBe(false);
    });

    test('should prevent admin from deactivating themselves', async () => {
      const response = await request(app)
        .patch(`/api/users/${itAdmin.id}/deactivate`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail for IT user', async () => {
      const response = await request(app)
        .patch(`/api/users/${endUser.id}/deactivate`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id/activate', () => {
    beforeEach(async () => {
      // Deactivate user first
      endUser.isActive = false;
      await endUser.save();
    });

    test('should activate user as IT admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${endUser.id}/activate`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.isActive).toBe(true);
    });

    test('should fail for IT user', async () => {
      const response = await request(app)
        .patch(`/api/users/${endUser.id}/activate`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user as IT admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${endUser.id}`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await User.findByPk(endUser.id);
      expect(deletedUser).toBeNull();
    });

    test('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${itAdmin.id}`)
        .set('Authorization', `Bearer ${itAdminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail for IT user', async () => {
      const response = await request(app)
        .delete(`/api/users/${endUser.id}`)
        .set('Authorization', `Bearer ${itUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail for end user', async () => {
      const response = await request(app)
        .delete(`/api/users/${itUser.id}`)
        .set('Authorization', `Bearer ${endUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
