const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000],
    },
  },
  category: {
    type: DataTypes.ENUM('hardware', 'software', 'network', 'access', 'other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requester_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_to',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at',
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at',
  },
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: (ticket) => {
      if (ticket.changed('status')) {
        const now = new Date();
        if (ticket.status === 'resolved' && !ticket.resolvedAt) {
          ticket.resolvedAt = now;
        }
        if (ticket.status === 'closed' && !ticket.closedAt) {
          ticket.closedAt = now;
        }
      }
    },
  },
});

// Instance methods
Ticket.prototype.canBeModifiedBy = function(user) {
  // End users can only modify their own open tickets
  if (user.role === 'end_user') {
    return this.requesterId === user.id && this.status === 'open';
  }
  // IT users and admins can modify any ticket
  return ['it_user', 'it_admin'].includes(user.role);
};

Ticket.prototype.canBeDeletedBy = function(user) {
  // Only IT admins can delete tickets
  return user.role === 'it_admin';
};

Ticket.prototype.canBeAssignedBy = function(user) {
  // IT users can assign to themselves, IT admins can assign to anyone
  return ['it_user', 'it_admin'].includes(user.role);
};

Ticket.prototype.getDurationString = function() {
  const created = new Date(this.createdAt);
  const resolved = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = resolved - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
  return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
};

// Class methods
Ticket.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { requesterId: userId },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

Ticket.findAssignedTo = function(userId, options = {}) {
  return this.findAll({
    where: { assignedTo: userId },
    order: [['priority', 'DESC'], ['createdAt', 'ASC']],
    ...options,
  });
};

Ticket.findUnassigned = function(options = {}) {
  return this.findAll({
    where: {
      assignedTo: null,
      status: ['open', 'in_progress'],
    },
    order: [['priority', 'DESC'], ['createdAt', 'ASC']],
    ...options,
  });
};

Ticket.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

module.exports = Ticket;
