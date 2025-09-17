import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import { ticketService, userService } from '../../services/api';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  USER_ROLES,
} from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(Object.values(TICKET_CATEGORIES), 'Invalid category'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(Object.values(TICKET_PRIORITIES), 'Invalid priority'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(Object.values(TICKET_STATUSES), 'Invalid status'),
});

const updateValidationSchema = Yup.object({
  comment: Yup.string()
    .required('Comment is required')
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment must not exceed 1000 characters'),
});

const statusColors = {
  [TICKET_STATUSES.OPEN]: 'error',
  [TICKET_STATUSES.IN_PROGRESS]: 'warning',
  [TICKET_STATUSES.RESOLVED]: 'info',
  [TICKET_STATUSES.CLOSED]: 'success',
};

const priorityColors = {
  [TICKET_PRIORITIES.LOW]: 'default',
  [TICKET_PRIORITIES.MEDIUM]: 'primary',
  [TICKET_PRIORITIES.HIGH]: 'warning',
  [TICKET_PRIORITIES.CRITICAL]: 'error',
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [itUsers, setItUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isITUser = user?.role === USER_ROLES.IT_USER || user?.role === USER_ROLES.IT_ADMIN;
  const isITAdmin = user?.role === USER_ROLES.IT_ADMIN;
  const isOwner = ticket?.createdBy === user?.id;
  const canEdit = isITUser || isOwner;
  const canDelete = isITAdmin;
  const canAssign = isITUser;

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ticketResponse, updatesResponse] = await Promise.all([
        ticketService.getTicket(id),
        ticketService.getTicketUpdates(id),
      ]);
      
      setTicket(ticketResponse.data);
      setUpdates(updatesResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchItUsers = async () => {
    try {
      const response = await userService.getUsers({ role: 'it_user,it_admin' });
      setItUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch IT users:', err);
    }
  };

  useEffect(() => {
    fetchTicket();
    if (isITUser) {
      fetchItUsers();
    }
  }, [id, isITUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSubmitError('');
  };

  const handleTicketUpdate = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      await ticketService.updateTicket(id, values);
      
      // Refresh ticket data
      await fetchTicket();
      setIsEditing(false);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to update ticket'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTicket = async (assignedTo) => {
    try {
      await ticketService.updateTicket(id, { assignedTo });
      await fetchTicket();
      setAssignDialogOpen(false);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to assign ticket'
      );
    }
  };

  const handleAddUpdate = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      await ticketService.addTicketUpdate(id, values);
      
      // Refresh updates
      const updatesResponse = await ticketService.getTicketUpdates(id);
      setUpdates(updatesResponse.data);
      setUpdateDialogOpen(false);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to add update'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      setIsSubmitting(true);
      await ticketService.deleteTicket(id);
      navigate('/tickets');
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to delete ticket'
      );
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        className="gradient-bg"
      >
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Box className="gradient-bg" sx={{ minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}
        >
          {error || 'Ticket not found'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/tickets')}
          className="glass-button"
        >
          Back to Tickets
        </Button>
      </Box>
    );
  }

  return (
    <Box className="gradient-bg" sx={{ minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton 
            onClick={() => navigate('/tickets')}
            className="glass-button"
          >
            <BackIcon />
          </IconButton>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ticket #{ticket.id}
          </Typography>
          <Chip
            label={ticket.status.replace('_', ' ').toUpperCase()}
            className={`status-${ticket.status.toLowerCase().replace('_', '-')}`}
            sx={{ 
              fontWeight: 600,
              borderRadius: '16px'
            }}
          />
          <Chip
            label={ticket.priority.toUpperCase()}
            className={`priority-${ticket.priority.toLowerCase()}`}
            sx={{ 
              fontWeight: 600,
              borderRadius: '16px'
            }}
          />
        </Stack>

        {canEdit && (
          <Stack direction="row" spacing={1}>
            {canDelete && (
              <IconButton
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                className="glass-button"
              >
                <DeleteIcon />
              </IconButton>
            )}
            {canAssign && (
              <Button
                variant="outlined"
                startIcon={<AssignIcon />}
                onClick={() => setAssignDialogOpen(true)}
                className="glass-button"
              >
                Assign
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<CommentIcon />}
              onClick={() => setUpdateDialogOpen(true)}
              className="glass-button"
            >
              Add Update
            </Button>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "glass-button" : "gradient-button"}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </Stack>
        )}
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {/* Ticket Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {isEditing ? (
          <Formik
            initialValues={{
              title: ticket.title,
              description: ticket.description,
              category: ticket.category,
              priority: ticket.priority,
              status: ticket.status,
            }}
            validationSchema={validationSchema}
            onSubmit={handleTicketUpdate}
          >
            {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
              <Form>
                <Stack spacing={3}>
                  <Field name="title">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        fullWidth
                        required
                        error={touched.title && Boolean(errors.title)}
                        helperText={touched.title && errors.title}
                      />
                    )}
                  </Field>

                  <Field name="description">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        required
                        multiline
                        rows={6}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                      />
                    )}
                  </Field>

                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={values.category}
                        label="Category"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.category && Boolean(errors.category)}
                      >
                        {Object.entries(TICKET_CATEGORIES).map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {key.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={values.priority}
                        label="Priority"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.priority && Boolean(errors.priority)}
                      >
                        {Object.entries(TICKET_PRIORITIES).map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {key}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {isITUser && (
                      <FormControl fullWidth required>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={values.status}
                          label="Status"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.status && Boolean(errors.status)}
                        >
                          {Object.entries(TICKET_STATUSES).map(([key, value]) => (
                            <MenuItem key={value} value={value}>
                              {key.replace('_', ' ').toUpperCase()}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {ticket.title}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {ticket.category.replace('_', ' ').toUpperCase()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {ticket.User?.firstName} {ticket.User?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ticket.User?.email}
                </Typography>
              </Box>
              
              {ticket.AssignedUser && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body1">
                    {ticket.AssignedUser.firstName} {ticket.AssignedUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.AssignedUser.email}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(ticket.createdAt)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(ticket.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Ticket Updates */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Updates & Comments
        </Typography>
        
        {updates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No updates yet.
          </Typography>
        ) : (
          <List>
            {updates.map((update, index) => (
              <React.Fragment key={update.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {update.User?.firstName} {update.User?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(update.createdAt)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                        {update.comment}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < updates.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={ticket.assignedTo || ''}
              label="Assign To"
              onChange={(e) => handleAssignTicket(e.target.value || null)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {itUsers.map((itUser) => (
                <MenuItem key={itUser.id} value={itUser.id}>
                  {itUser.firstName} {itUser.lastName} ({itUser.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Update</DialogTitle>
        <Formik
          initialValues={{ comment: '' }}
          validationSchema={updateValidationSchema}
          onSubmit={handleAddUpdate}
        >
          {({ values, errors, touched, isValid }) => (
            <Form>
              <DialogContent>
                <Field name="comment">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Comment"
                      fullWidth
                      required
                      multiline
                      rows={4}
                      error={touched.comment && Boolean(errors.comment)}
                      helperText={touched.comment && errors.comment}
                      placeholder="Add a comment or update about this ticket..."
                    />
                  )}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setUpdateDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? 'Adding...' : 'Add Update'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTicket}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetail;
