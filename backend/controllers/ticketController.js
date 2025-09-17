const { Ticket, User, TicketUpdate } = require('../models');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class TicketController {
  // Create new ticket
  static async createTicket(req, res) {
    try {
      const { title, description, category, priority } = req.body;

      const ticket = await Ticket.create({
        title,
        description,
        category,
        priority: priority || 'medium',
        requesterId: req.user.id,
      });

      // Load the ticket with requester information
      const ticketWithRequester = await Ticket.findByPk(ticket.id, {
        include: [
          { model: User, as: 'requester' },
          { model: User, as: 'assignee' },
        ],
      });

      // Send email notification
      try {
        await EmailService.sendTicketCreatedNotification(ticketWithRequester, req.user);
      } catch (emailError) {
        logger.error('Failed to send ticket creation email:', emailError);
      }

      logger.info(`New ticket created by ${req.user.email}: #${ticket.id}`);

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: { ticket: ticketWithRequester },
      });
    } catch (error) {
      logger.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ticket',
        error: error.message,
      });
    }
  }

  // Get all tickets with filtering and pagination
  static async getAllTickets(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        priority,
        assignedTo,
        requesterId,
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters based on user role
      if (req.user.role === 'end_user') {
        whereClause.requesterId = req.user.id;
      } else {
        // IT users can filter by requester
        if (requesterId) {
          whereClause.requesterId = requesterId;
        }
      }

      // Status filter
      if (status) {
        whereClause.status = status;
      }

      // Category filter
      if (category) {
        whereClause.category = category;
      }

      // Priority filter
      if (priority) {
        whereClause.priority = priority;
      }

      // Assigned to filter
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }

      // Search in title and description
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: tickets } = await Ticket.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalTickets: count,
            hasNext: offset + tickets.length < count,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get all tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets',
        error: error.message,
      });
    }
  }

  // Get ticket by ID
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findByPk(id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
          {
            model: TicketUpdate,
            as: 'updates',
            include: [
              { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check access permissions
      if (req.user.role === 'end_user' && ticket.requesterId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this ticket',
        });
      }

      res.json({
        success: true,
        data: { ticket },
      });
    } catch (error) {
      logger.error('Get ticket by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket',
        error: error.message,
      });
    }
  }

  // Update ticket
  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { title, description, category, priority, status, assignedTo } = req.body;

      const ticket = await Ticket.findByPk(id, {
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

      // Check permissions
      if (!ticket.canBeModifiedBy(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to modify this ticket',
        });
      }

      // Store old values for tracking changes
      const oldStatus = ticket.status;
      const oldPriority = ticket.priority;
      const oldAssignedTo = ticket.assignedTo;

      // Update ticket fields
      if (title !== undefined) ticket.title = title;
      if (description !== undefined) ticket.description = description;
      if (category !== undefined) ticket.category = category;
      if (priority !== undefined) ticket.priority = priority;
      
      // Only IT users can change status and assignment
      if (['it_user', 'it_admin'].includes(req.user.role)) {
        if (status !== undefined) ticket.status = status;
        if (assignedTo !== undefined) {
          ticket.assignedTo = assignedTo;
        }
      }

      await ticket.save();

      // Create update records and send notifications
      const promises = [];

      if (status && status !== oldStatus) {
        promises.push(
          TicketUpdate.createStatusChange(ticket.id, req.user.id, oldStatus, status)
        );
        
        if (ticket.requester) {
          promises.push(
            EmailService.sendTicketStatusUpdateNotification(
              ticket,
              ticket.requester,
              oldStatus,
              status,
              req.user
            )
          );
        }
      }

      if (priority && priority !== oldPriority) {
        promises.push(
          TicketUpdate.createPriorityChange(ticket.id, req.user.id, oldPriority, priority)
        );
      }

      if (assignedTo !== undefined && assignedTo !== oldAssignedTo) {
        promises.push(
          TicketUpdate.createAssignment(ticket.id, req.user.id, oldAssignedTo, assignedTo)
        );

        if (assignedTo) {
          const assignee = await User.findByPk(assignedTo);
          if (assignee && ticket.requester) {
            promises.push(
              EmailService.sendTicketAssignedNotification(ticket, assignee, ticket.requester)
            );
          }
        }
      }

      await Promise.all(promises);

      // Reload ticket with updated information
      const updatedTicket = await Ticket.findByPk(ticket.id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        ],
      });

      logger.info(`Ticket updated by ${req.user.email}: #${ticket.id}`);

      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: { ticket: updatedTicket },
      });
    } catch (error) {
      logger.error('Update ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket',
        error: error.message,
      });
    }
  }

  // Add comment to ticket
  static async addComment(req, res) {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      const ticket = await Ticket.findByPk(id, {
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

      // Check access permissions
      if (req.user.role === 'end_user' && ticket.requesterId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this ticket',
        });
      }

      // Create comment update
      const ticketUpdate = await TicketUpdate.createComment(ticket.id, req.user.id, comment);

      // Send email notification
      if (ticket.requester) {
        try {
          await EmailService.sendTicketCommentNotification(
            ticket,
            ticket.requester,
            req.user,
            comment
          );
        } catch (emailError) {
          logger.error('Failed to send comment notification email:', emailError);
        }
      }

      // Load the update with user information
      const updateWithUser = await TicketUpdate.findByPk(ticketUpdate.id, {
        include: [
          { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] },
        ],
      });

      logger.info(`Comment added to ticket #${ticket.id} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { update: updateWithUser },
      });
    } catch (error) {
      logger.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message,
      });
    }
  }

  // Assign ticket to user (IT staff only)
  static async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      const ticket = await Ticket.findByPk(id, {
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

      // IT users can only assign to themselves, IT admins can assign to anyone
      if (req.user.role === 'it_user' && assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign tickets to yourself',
        });
      }

      const oldAssignedTo = ticket.assignedTo;
      ticket.assignedTo = assignedTo;
      await ticket.save();

      // Create assignment update
      await TicketUpdate.createAssignment(ticket.id, req.user.id, oldAssignedTo, assignedTo);

      // Send notifications
      if (assignedTo) {
        const assignee = await User.findByPk(assignedTo);
        if (assignee && ticket.requester) {
          try {
            await EmailService.sendTicketAssignedNotification(ticket, assignee, ticket.requester);
          } catch (emailError) {
            logger.error('Failed to send assignment notification email:', emailError);
          }
        }
      }

      const updatedTicket = await Ticket.findByPk(ticket.id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        ],
      });

      logger.info(`Ticket #${ticket.id} assigned by ${req.user.email} to user ID: ${assignedTo}`);

      res.json({
        success: true,
        message: 'Ticket assigned successfully',
        data: { ticket: updatedTicket },
      });
    } catch (error) {
      logger.error('Assign ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign ticket',
        error: error.message,
      });
    }
  }

  // Delete ticket (IT admin only)
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      await ticket.destroy();

      logger.info(`Ticket deleted by ${req.user.email}: #${ticket.id}`);

      res.json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (error) {
      logger.error('Delete ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ticket',
        error: error.message,
      });
    }
  }

  // Get ticket statistics (IT staff only)
  static async getTicketStats(req, res) {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        unassignedTickets,
        myTickets,
      ] = await Promise.all([
        Ticket.count(),
        Ticket.count({ where: { status: 'open' } }),
        Ticket.count({ where: { status: 'in_progress' } }),
        Ticket.count({ where: { status: 'resolved' } }),
        Ticket.count({ where: { status: 'closed' } }),
        Ticket.count({ where: { assignedTo: null, status: ['open', 'in_progress'] } }),
        Ticket.count({ where: { assignedTo: req.user.id } }),
      ]);

      const stats = {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        unassigned: unassignedTickets,
        assignedToMe: myTickets,
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get ticket stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket statistics',
        error: error.message,
      });
    }
  }
}

module.exports = TicketController;
