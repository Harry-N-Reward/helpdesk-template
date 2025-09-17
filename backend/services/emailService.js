const { transporter, fromEmail } = require('../config/email');
const { EmailNotification } = require('../models');
const logger = require('../utils/logger');

class EmailService {
  static async sendTicketCreatedNotification(ticket, requester) {
    const subject = `New Support Ticket Created - #${ticket.id}`;
    const body = `
      <h2>New Support Ticket Created</h2>
      <p>Hello ${requester.firstName},</p>
      
      <p>Your support ticket has been successfully created. Here are the details:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Description:</strong></p>
        <p>${ticket.description}</p>
      </div>
      
      <p>Our IT team will review your ticket and respond as soon as possible.</p>
      <p>You can track the progress of your ticket by logging into the support portal.</p>
      
      <p>Thank you,<br>IT Support Team</p>
    `;

    return this.queueEmail(ticket.id, requester.email, subject, body);
  }

  static async sendTicketAssignedNotification(ticket, assignee, requester) {
    // Notify requester
    const requesterSubject = `Your Support Ticket #${ticket.id} Has Been Assigned`;
    const requesterBody = `
      <h2>Ticket Assignment Update</h2>
      <p>Hello ${requester.firstName},</p>
      
      <p>Your support ticket #${ticket.id} has been assigned to ${assignee.getFullName()}.</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Assigned to:</strong> ${assignee.getFullName()}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
      </div>
      
      <p>Our team member will be working on resolving your issue.</p>
      
      <p>Thank you,<br>IT Support Team</p>
    `;

    // Notify assignee
    const assigneeSubject = `Support Ticket #${ticket.id} Assigned to You`;
    const assigneeBody = `
      <h2>New Ticket Assignment</h2>
      <p>Hello ${assignee.firstName},</p>
      
      <p>A support ticket has been assigned to you:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Requester:</strong> ${requester.getFullName()} (${requester.email})</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Description:</strong></p>
        <p>${ticket.description}</p>
      </div>
      
      <p>Please log into the support portal to view full details and begin working on this ticket.</p>
      
      <p>Thank you,<br>IT Support Team</p>
    `;

    await this.queueEmail(ticket.id, requester.email, requesterSubject, requesterBody);
    await this.queueEmail(ticket.id, assignee.email, assigneeSubject, assigneeBody);
  }

  static async sendTicketStatusUpdateNotification(ticket, requester, oldStatus, newStatus, updater, comment = null) {
    const subject = `Support Ticket #${ticket.id} Status Updated - ${newStatus}`;
    
    let body = `
      <h2>Ticket Status Update</h2>
      <p>Hello ${requester.firstName},</p>
      
      <p>The status of your support ticket has been updated:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p><strong>Updated by:</strong> ${updater.getFullName()}</p>
    `;

    if (comment) {
      body += `<p><strong>Comments:</strong></p><p>${comment}</p>`;
    }

    body += `
      </div>
      
      <p>You can view the full details by logging into the support portal.</p>
      
      <p>Thank you,<br>IT Support Team</p>
    `;

    return this.queueEmail(ticket.id, requester.email, subject, body);
  }

  static async sendTicketCommentNotification(ticket, requester, commenter, comment) {
    // Don't send notification if commenter is the requester
    if (commenter.id === requester.id) {
      return;
    }

    const subject = `New Comment on Support Ticket #${ticket.id}`;
    const body = `
      <h2>New Comment Added</h2>
      <p>Hello ${requester.firstName},</p>
      
      <p>A new comment has been added to your support ticket:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Comment by:</strong> ${commenter.getFullName()}</p>
        <p><strong>Comment:</strong></p>
        <p>${comment}</p>
      </div>
      
      <p>You can reply by logging into the support portal.</p>
      
      <p>Thank you,<br>IT Support Team</p>
    `;

    return this.queueEmail(ticket.id, requester.email, subject, body);
  }

  static async sendTicketResolvedNotification(ticket, requester, resolver) {
    const subject = `Support Ticket #${ticket.id} Resolved`;
    const body = `
      <h2>Ticket Resolved</h2>
      <p>Hello ${requester.firstName},</p>
      
      <p>Great news! Your support ticket has been resolved:</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>Ticket #${ticket.id}</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Resolved by:</strong> ${resolver.getFullName()}</p>
        <p><strong>Resolution Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>If you're satisfied with the resolution, no further action is needed. The ticket will be automatically closed after 48 hours.</p>
      <p>If you need additional assistance or the issue persists, please reply to this email or create a new ticket.</p>
      
      <p>Thank you for using our support services!</p>
      <p>IT Support Team</p>
    `;

    return this.queueEmail(ticket.id, requester.email, subject, body);
  }

  static async queueEmail(ticketId, recipientEmail, subject, body) {
    try {
      const notification = await EmailNotification.createNotification(
        ticketId,
        recipientEmail,
        subject,
        body
      );

      // Try to send immediately
      await this.sendQueuedEmail(notification);
      return notification;
    } catch (error) {
      logger.error('Error queuing email:', error);
      throw error;
    }
  }

  static async sendQueuedEmail(notification) {
    try {
      const mailOptions = {
        from: fromEmail,
        to: notification.recipientEmail,
        subject: notification.subject,
        html: notification.body,
      };

      await transporter.sendMail(mailOptions);
      await notification.markAsSent();
      
      logger.info(`Email sent successfully to ${notification.recipientEmail}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${notification.recipientEmail}:`, error);
      await notification.markAsFailed(error.message);
      return false;
    }
  }

  static async processPendingEmails() {
    try {
      const pendingEmails = await EmailNotification.findPending(10);
      
      for (const email of pendingEmails) {
        await this.sendQueuedEmail(email);
        // Add small delay to avoid overwhelming the email server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (pendingEmails.length > 0) {
        logger.info(`Processed ${pendingEmails.length} pending emails`);
      }
    } catch (error) {
      logger.error('Error processing pending emails:', error);
    }
  }

  static async retryFailedEmails() {
    try {
      const failedEmails = await EmailNotification.findFailed();
      
      for (const email of failedEmails) {
        // Reset status to pending for retry
        email.status = 'pending';
        email.errorMessage = null;
        await email.save();
      }

      logger.info(`Reset ${failedEmails.length} failed emails for retry`);
    } catch (error) {
      logger.error('Error retrying failed emails:', error);
    }
  }
}

// Process pending emails every 30 seconds
setInterval(() => {
  EmailService.processPendingEmails();
}, 30000);

module.exports = EmailService;
