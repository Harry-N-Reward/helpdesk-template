import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Add as AddIcon,
  Priority as PriorityIcon,
  Category as CategoryIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { ticketService } from '../../services/api';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants';

const priorityData = {
  [TICKET_PRIORITIES.LOW]: {
    color: '#84fab0',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    description: 'Minor issues that don\'t affect productivity'
  },
  [TICKET_PRIORITIES.MEDIUM]: {
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Issues that moderately affect productivity'
  },
  [TICKET_PRIORITIES.HIGH]: {
    color: '#ffc3a0',
    gradient: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)',
    description: 'Issues that significantly impact work'
  },
  [TICKET_PRIORITIES.CRITICAL]: {
    color: '#ff9a9e',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    description: 'System down or security issues'
  },
};

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
});

const CreateTicket = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: '',
    description: '',
    category: '',
    priority: TICKET_PRIORITIES.MEDIUM,
  };

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      const response = await ticketService.createTicket(values);
      
      // Redirect to the created ticket
      navigate(`/tickets/${response.data.id}`);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to create ticket'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  width: 56,
                  height: 56,
                }}
              >
                <AddIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Create New Ticket
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Submit a new support request
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Back to Tickets">
              <IconButton
                onClick={handleCancel}
                sx={{
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
              <Form>
                <Stack spacing={4}>
                  {submitError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        borderRadius: '12px',
                        '& .MuiAlert-icon': {
                          fontSize: '1.2rem',
                        },
                      }}
                    >
                      {submitError}
                    </Alert>
                  )}

                  {/* Title Section */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TitleIcon color="primary" />
                      Ticket Title
                    </Typography>
                    <Field name="title">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Brief description of the issue"
                          fullWidth
                          required
                          error={touched.title && Boolean(errors.title)}
                          helperText={touched.title && errors.title}
                          placeholder="e.g., Unable to access email, Computer running slowly"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                transition: 'transform 0.2s ease',
                              },
                            },
                          }}
                        />
                      )}
                    </Field>
                  </Box>

                  {/* Description Section */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon color="primary" />
                      Detailed Description
                    </Typography>
                    <Field name="description">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Provide detailed information about the issue"
                          fullWidth
                          required
                          multiline
                          rows={6}
                          error={touched.description && Boolean(errors.description)}
                          helperText={touched.description && errors.description}
                          placeholder="Please include:&#10;• What were you trying to do?&#10;• What happened instead?&#10;• Any error messages you saw&#10;• Steps to reproduce the issue"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      )}
                    </Field>
                  </Box>

                  {/* Category and Priority Section */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon color="primary" />
                      Classification
                    </Typography>
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                          name="category"
                          value={values.category}
                          label="Category"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.category && Boolean(errors.category)}
                          sx={{
                            borderRadius: '12px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderRadius: '12px',
                            },
                          }}
                        >
                          {Object.entries(TICKET_CATEGORIES).map(([key, value]) => (
                            <MenuItem key={value} value={value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CategoryIcon fontSize="small" color="primary" />
                                {key.replace('_', ' ')}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.category && errors.category && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.category}
                          </Typography>
                        )}
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
                          sx={{
                            borderRadius: '12px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderRadius: '12px',
                            },
                          }}
                        >
                          {Object.entries(TICKET_PRIORITIES).map(([key, value]) => (
                            <MenuItem key={value} value={value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: priorityData[value].gradient,
                                  }}
                                />
                                {key}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.priority && errors.priority && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.priority}
                          </Typography>
                        )}
                      </FormControl>
                    </Stack>
                  </Box>

                  {/* Priority Guidelines */}
                  <Card sx={{ background: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon color="primary" />
                        Priority Guidelines
                      </Typography>
                      <Stack spacing={2}>
                        {Object.entries(priorityData).map(([priority, data]) => (
                          <Box key={priority} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={priority.toUpperCase()}
                              sx={{
                                background: data.gradient,
                                color: 'white',
                                fontWeight: 600,
                                minWidth: 80,
                                fontSize: '0.75rem',
                              }}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {data.description}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Divider />

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1.5,
                        borderColor: 'grey.300',
                        color: 'text.secondary',
                        '&:hover': {
                          borderColor: 'grey.400',
                          background: 'grey.50',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      disabled={!isValid || isSubmitting}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          boxShadow: '0 12px 48px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          opacity: 0.7,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateTicket;
