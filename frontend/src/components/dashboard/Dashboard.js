import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add,
  ConfirmationNumber,
  Assignment,
  CheckCircle,
  Cancel,
  Visibility,
  TrendingUp,
  Person,
  Business,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/api';
import { 
  formatRelativeTime, 
  getStatusColor, 
  getPriorityColor,
  formatStatus,
  getFullName,
  truncateText 
} from '../../utils/helpers';
import { TICKET_STATUSES } from '../../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isItStaff } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [];

      // Load stats for IT staff
      if (isItStaff()) {
        promises.push(ticketService.getStats());
      }

      // Load recent tickets
      promises.push(
        ticketService.getTickets({
          page: 1,
          limit: 5,
          ...(user.role === 'end_user' && { requesterId: user.id }),
        })
      );

      const responses = await Promise.all(promises);

      if (isItStaff()) {
        setStats(responses[0].data.data.stats);
        setRecentTickets(responses[1].data.data.tickets);
      } else {
        setRecentTickets(responses[0].data.data.tickets);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  const handleViewAllTickets = () => {
    navigate('/tickets');
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {user?.role === 'end_user' && 'Manage your support tickets and get help from our IT team.'}
          {user?.role === 'it_user' && 'View and manage support tickets from team members.'}
          {user?.role === 'it_admin' && 'Oversee all support operations and manage the team.'}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Statistics Cards (IT Staff Only) */}
        {isItStaff() && stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Tickets
                      </Typography>
                      <Typography variant="h4">
                        {stats.total}
                      </Typography>
                    </Box>
                    <ConfirmationNumber color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Open Tickets
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {stats.open}
                      </Typography>
                    </Box>
                    <TrendingUp color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        In Progress
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {stats.inProgress}
                      </Typography>
                    </Box>
                    <Assignment color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Assigned to Me
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.assignedToMe}
                      </Typography>
                    </Box>
                    <Person color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Quick Actions */}
        <Grid item xs={12} md={user?.role === 'end_user' ? 12 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateTicket}
                    size="large"
                  >
                    Create New Ticket
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ConfirmationNumber />}
                    onClick={handleViewAllTickets}
                    size="large"
                  >
                    View All Tickets
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* User Info (End Users) */}
        {user?.role === 'end_user' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {getFullName(user)}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {user.email}
                  </Typography>
                  
                  {user.department && (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Department
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {user.department}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* Recent Tickets */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {user?.role === 'end_user' ? 'Your Recent Tickets' : 'Recent Tickets'}
                </Typography>
                <Button
                  size="small"
                  onClick={handleViewAllTickets}
                  endIcon={<Visibility />}
                >
                  View All
                </Button>
              </Box>

              {recentTickets.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  No tickets found. {user?.role === 'end_user' && 'Create your first support ticket!'}
                </Typography>
              ) : (
                <List>
                  {recentTickets.map((ticket, index) => (
                    <React.Fragment key={ticket.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">
                                #{ticket.id} - {truncateText(ticket.title, 50)}
                              </Typography>
                              <Chip
                                label={formatStatus(ticket.status)}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(ticket.status),
                                  color: 'white',
                                }}
                              />
                              <Chip
                                label={ticket.priority}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: getPriorityColor(ticket.priority),
                                  color: getPriorityColor(ticket.priority),
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {truncateText(ticket.description, 100)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Created {formatRelativeTime(ticket.createdAt)}
                                {ticket.requester && user?.role !== 'end_user' && 
                                  ` by ${getFullName(ticket.requester)}`
                                }
                                {ticket.assignee && 
                                  ` • Assigned to ${getFullName(ticket.assignee)}`
                                }
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleViewTicket(ticket.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentTickets.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
