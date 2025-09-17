const { sequelize } = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const TicketUpdate = require('./TicketUpdate');
const EmailNotification = require('./EmailNotification');

// Define associations
User.hasMany(Ticket, {
  foreignKey: 'requesterId',
  as: 'requestedTickets',
  onDelete: 'CASCADE',
});

User.hasMany(Ticket, {
  foreignKey: 'assignedTo',
  as: 'assignedTickets',
  onDelete: 'SET NULL',
});

User.hasMany(TicketUpdate, {
  foreignKey: 'updatedBy',
  as: 'ticketUpdates',
  onDelete: 'CASCADE',
});

Ticket.belongsTo(User, {
  foreignKey: 'requesterId',
  as: 'requester',
});

Ticket.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee',
});

Ticket.hasMany(TicketUpdate, {
  foreignKey: 'ticketId',
  as: 'updates',
  onDelete: 'CASCADE',
});

Ticket.hasMany(EmailNotification, {
  foreignKey: 'ticketId',
  as: 'emailNotifications',
  onDelete: 'CASCADE',
});

TicketUpdate.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater',
});

TicketUpdate.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

EmailNotification.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Ticket,
  TicketUpdate,
  EmailNotification,
};
