const { User } = require('../models');
const logger = require('../utils/logger');

class UserController {
  // Get all users (IT staff only)
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, department, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      // Filter by role
      if (role) {
        whereClause.role = role;
      }

      // Filter by department
      if (department) {
        whereClause.department = department;
      }

      // Search by name or email
      if (search) {
        const { Op } = require('sequelize');
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalUsers: count,
            hasNext: offset + users.length < count,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message,
      });
    }
  }

  // Get IT users for assignment (IT staff only)
  static async getItUsers(req, res) {
    try {
      const itUsers = await User.findItUsers();

      res.json({
        success: true,
        data: { users: itUsers },
      });
    } catch (error) {
      logger.error('Get IT users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch IT users',
        error: error.message,
      });
    }
  }

  // Create new user (IT admin only)
  static async createUser(req, res) {
    try {
      const { email, password, firstName, lastName, role, department, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Create new user
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role: role || 'end_user',
        department,
        phone,
      });

      logger.info(`New user created by ${req.user.email}: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }

  // Update user (IT admin only)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, department, phone, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (role !== undefined) user.role = role;
      if (department !== undefined) user.department = department;
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      logger.info(`User updated by ${req.user.email}: ${user.email}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }

  // Deactivate user (IT admin only)
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account',
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.isActive = false;
      await user.save();

      logger.info(`User deactivated by ${req.user.email}: ${user.email}`);

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user',
        error: error.message,
      });
    }
  }

  // Activate user (IT admin only)
  static async activateUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.isActive = true;
      await user.save();

      logger.info(`User activated by ${req.user.email}: ${user.email}`);

      res.json({
        success: true,
        message: 'User activated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate user',
        error: error.message,
      });
    }
  }

  // Delete user (IT admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await user.destroy();

      logger.info(`User deleted by ${req.user.email}: ${user.email}`);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
