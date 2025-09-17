const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Check if user is IT staff (IT user or admin)
const requireItUser = authorize('it_user', 'it_admin');

// Check if user is IT admin
const requireItAdmin = authorize('it_admin');

// Check if user can access ticket (owner or IT staff)
const canAccessTicket = async (req, res, next) => {
  try {
    const { Ticket } = require('../models');
    const ticketId = req.params.id || req.params.ticketId;
    
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID required',
      });
    }

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'assignee' },
      ],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // IT users and admins can access all tickets
    if (['it_user', 'it_admin'].includes(req.user.role)) {
      req.ticket = ticket;
      return next();
    }

    // End users can only access their own tickets
    if (req.user.role === 'end_user' && ticket.requesterId === req.user.id) {
      req.ticket = ticket;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied to this ticket',
    });
  } catch (error) {
    logger.error('Ticket access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking ticket access',
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  requireItUser,
  requireItAdmin,
  canAccessTicket,
};
