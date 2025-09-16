import React, { useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ApiDocViewer: React.FC = () => {
  const { service } = useParams<{ service: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (service) {
      // Redirect to Redocly server with the correct API path
      window.location.href = `http://127.0.0.1:4000/apis/${service.toLowerCase()}-api/`;
    }
  }, [service]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        bgcolor: 'white', 
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        boxShadow: 1
      }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
          Redirecting to {service} API Documentation...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you are not redirected, <a href={`http://127.0.0.1:4000/apis/${service?.toLowerCase()}-api/`}>click here</a>
        </Typography>
        <IconButton 
          onClick={() => navigate('/documentation')}
          sx={{ mt: 2 }}
        >
          <ArrowBackIcon /> Back to Documentation Portal
        </IconButton>
      </Box>
    </Box>
  );
};

export default ApiDocViewer;