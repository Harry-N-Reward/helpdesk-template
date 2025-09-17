const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TicketUpdate = sequelize.define('TicketUpdate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ticket_id',
    references: {
      model: 'tickets',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updateType: {
    type: DataTypes.ENUM('status_change', 'assignment', 'comment', 'priority_change'),
    allowNull: false,
    field: 'update_type',
  },
  oldValue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'old_value',
  },
  newValue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'new_value',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ticket_updates',
  timestamps: true,
  underscored: true,
  updatedAt: false, // Only track creation time
});

// Class methods
TicketUpdate.createStatusChange = function(ticketId, userId, oldStatus, newStatus, comment = null) {
  return this.create({
    ticketId,
    updatedBy: userId,
    updateType: 'status_change',
    oldValue: oldStatus,
    newValue: newStatus,
    comment,
  });
};

TicketUpdate.createAssignment = function(ticketId, userId, oldAssignee, newAssignee, comment = null) {
  return this.create({
    ticketId,
    updatedBy: userId,
    updateType: 'assignment',
    oldValue: oldAssignee ? oldAssignee.toString() : null,
    newValue: newAssignee ? newAssignee.toString() : null,
    comment,
  });
};

TicketUpdate.createComment = function(ticketId, userId, comment) {
  return this.create({
    ticketId,
    updatedBy: userId,
    updateType: 'comment',
    comment,
  });
};

TicketUpdate.createPriorityChange = function(ticketId, userId, oldPriority, newPriority, comment = null) {
  return this.create({
    ticketId,
    updatedBy: userId,
    updateType: 'priority_change',
    oldValue: oldPriority,
    newValue: newPriority,
    comment,
  });
};

TicketUpdate.findByTicket = function(ticketId, options = {}) {
  return this.findAll({
    where: { ticketId },
    order: [['createdAt', 'ASC']],
    ...options,
  });
};

module.exports = TicketUpdate;
