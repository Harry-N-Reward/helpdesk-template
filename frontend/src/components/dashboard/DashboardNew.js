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
  ListItemAvatar,
  IconButton,
  Avatar,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
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
  Schedule,
  Priority,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

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

      // Load stats and recent tickets
      const [statsResponse, ticketsResponse] = await Promise.all([
        ticketService.getStats(),
        ticketService.getAll({ limit: 5, sort: 'createdAt', order: 'desc' })
      ]);

      setStats(statsResponse.data);
      setRecentTickets(ticketsResponse.data.tickets || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: theme.palette.info.main,
      in_progress: theme.palette.warning.main,
      resolved: theme.palette.success.main,
      closed: theme.palette.grey[500],
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: theme.palette.success.main,
      medium: theme.palette.warning.main,
      high: theme.palette.error.main,
      critical: theme.palette.error.dark,
    };
    return colors[priority] || theme.palette.grey[500];
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.12)}`,
        borderRadius: 3,
        transition: theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: color,
                mb: 0.5,
                lineHeight: 1,
              }}
            >
              {loading ? <Skeleton width={60} /> : value}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.primary"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                {change >= 0 ? (
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: change >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(change)}% from last month
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${alpha(color, 0.3)}`,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28, color: 'white' } })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const TicketItem = ({ ticket }) => (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        transition: theme.transitions.create(['background-color']),
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: alpha(getPriorityColor(ticket.priority), 0.1),
            color: getPriorityColor(ticket.priority),
            width: 40,
            height: 40,
          }}
        >
          <Priority />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 0.5 }}
            noWrap
          >
            {ticket.title}
          </Typography>
        }
        secondary={
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1}>
              <Chip
                label={formatStatus(ticket.status)}
                size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(ticket.status), 0.1),
                  color: getStatusColor(ticket.status),
                  fontSize: '0.6875rem',
                  height: 20,
                  fontWeight: 600,
                }}
              />
              <Chip
                label={ticket.priority.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: alpha(getPriorityColor(ticket.priority), 0.1),
                  color: getPriorityColor(ticket.priority),
                  fontSize: '0.6875rem',
                  height: 20,
                  fontWeight: 600,
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Created {new Date(ticket.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        }
      />
      <IconButton
        size="small"
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <Visibility />
      </IconButton>
    </ListItem>
  );

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: theme.custom?.gradients?.primary || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {getGreeting()}, {user?.firstName}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's what's happening with your support requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Tickets"
            value={stats?.total || 0}
            icon={<ConfirmationNumber />}
            color={theme.palette.info.main}
            change={12}
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Open Tickets"
            value={stats?.open || 0}
            icon={<Schedule />}
            color={theme.palette.warning.main}
            change={-5}
            subtitle="Awaiting response"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="In Progress"
            value={stats?.in_progress || 0}
            icon={<Assignment />}
            color={theme.palette.primary.main}
            change={8}
            subtitle="Being worked on"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            change={15}
            subtitle="This month"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Tickets */}
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              height: 'fit-content',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Tickets
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/tickets')}
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Stack>

              {recentTickets.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary',
                  }}
                >
                  <ConfirmationNumber sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No tickets yet
                  </Typography>
                  <Typography variant="body2">
                    Create your first support ticket to get started
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentTickets.map((ticket) => (
                    <TicketItem key={ticket.id} ticket={ticket} />
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/tickets/create')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: theme.custom?.gradients?.primary || theme.palette.primary.main,
                    boxShadow: theme.shadows[3],
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  Create New Ticket
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ConfirmationNumber />}
                  onClick={() => navigate('/tickets')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  View My Tickets
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Person />}
                  onClick={() => navigate('/profile')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Update Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: alpha(theme.palette.success.main, 0.02),
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Status
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">IT Services</Typography>
                    <Chip
                      label="Operational"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Response Time</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg. 2.5 hours
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
