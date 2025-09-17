const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmailNotification = sequelize.define('EmailNotification', {
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
  recipientEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'recipient_email',
    validate: {
      isEmail: true,
    },
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sent_at',
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
}, {
  tableName: 'email_notifications',
  timestamps: true,
  underscored: true,
  updatedAt: false, // Only track creation time
});

// Instance methods
EmailNotification.prototype.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

EmailNotification.prototype.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

// Class methods
EmailNotification.createNotification = function(ticketId, recipientEmail, subject, body) {
  return this.create({
    ticketId,
    recipientEmail,
    subject,
    body,
  });
};

EmailNotification.findPending = function(limit = 10) {
  return this.findAll({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']],
    limit,
  });
};

EmailNotification.findByTicket = function(ticketId) {
  return this.findAll({
    where: { ticketId },
    order: [['createdAt', 'DESC']],
  });
};

EmailNotification.findFailed = function() {
  return this.findAll({
    where: { status: 'failed' },
    order: [['createdAt', 'DESC']],
  });
};

module.exports = EmailNotification;
