import React from 'react';
import { Box, IconButton, Typography, AppBar, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const DocumentationViewer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Galaxy Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <iframe
          src="/docs-portal/portal-index.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Documentation Portal"
        />
      </Box>
    </Box>
  );
};

export default DocumentationViewer;