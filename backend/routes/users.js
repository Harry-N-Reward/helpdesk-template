const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, requireItUser, requireItAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateUserUpdate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// IT staff routes
router.get('/', requireItUser, UserController.getAllUsers);
router.get('/it-users', requireItUser, UserController.getItUsers);
router.get('/:id', requireItUser, UserController.getUserById);

// IT admin only routes
router.post('/', requireItAdmin, validateUserRegistration, UserController.createUser);
router.put('/:id', requireItAdmin, validateUserUpdate, UserController.updateUser);
router.patch('/:id/deactivate', requireItAdmin, UserController.deactivateUser);
router.patch('/:id/activate', requireItAdmin, UserController.activateUser);
router.delete('/:id', requireItAdmin, UserController.deleteUser);

module.exports = router;
