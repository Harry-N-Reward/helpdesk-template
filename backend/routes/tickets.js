const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const { authenticateToken, requireItUser, requireItAdmin, canAccessTicket } = require('../middleware/auth');
const {
  validateTicketCreation,
  validateTicketUpdate,
  validateComment,
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Routes accessible to all authenticated users
router.post('/', validateTicketCreation, TicketController.createTicket);
router.get('/', TicketController.getAllTickets);
router.get('/:id', TicketController.getTicketById);
router.post('/:id/comments', validateComment, TicketController.addComment);

// Routes for IT staff only
router.get('/stats/overview', requireItUser, TicketController.getTicketStats);
router.put('/:id', requireItUser, validateTicketUpdate, TicketController.updateTicket);
router.post('/:id/assign', requireItUser, TicketController.assignTicket);

// Routes for IT admin only
router.delete('/:id', requireItAdmin, TicketController.deleteTicket);

module.exports = router;
