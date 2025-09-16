import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import MemoryIcon from '@mui/icons-material/Memory';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface TileProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
  stats?: {
    healthy?: number;
    warning?: number;
    critical?: number;
    total?: number;
  };
  preview?: React.ReactNode;
  color?: string;
}

const DashboardTile: React.FC<TileProps> = ({ 
  title, 
  subtitle, 
  icon, 
  onClick, 
  stats,
  preview,
  color = '#1976d2'
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: 320,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(145deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
          '& .tile-icon': {
            transform: 'scale(1.1)',
          }
        }
      }}
      onClick={onClick}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Avatar
          className="tile-icon"
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            transition: 'transform 0.3s ease',
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ ml: 2, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white', opacity: 0.7 }}>
          <MoreHorizIcon />
        </IconButton>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {stats.healthy !== undefined && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`${stats.healthy} Healthy`}
                size="small"
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  color: '#4CAF50',
                  '& .MuiChip-icon': { color: '#4CAF50' }
                }}
              />
            )}
            {stats.warning !== undefined && stats.warning > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${stats.warning} Warning`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                  color: '#FF9800',
                  '& .MuiChip-icon': { color: '#FF9800' }
                }}
              />
            )}
            {stats.critical !== undefined && stats.critical > 0 && (
              <Chip
                icon={<ErrorIcon />}
                label={`${stats.critical} Critical`}
                size="small"
                sx={{
                  bgcolor: 'rgba(244, 67, 54, 0.2)',
                  color: '#f44336',
                  '& .MuiChip-icon': { color: '#f44336' }
                }}
              />
            )}
          </Box>
          {stats.total !== undefined && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              Total: {stats.total} items
            </Typography>
          )}
        </Box>
      )}

      {/* Preview Content */}
      {preview && (
        <Box sx={{ 
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {preview}
        </Box>
      )}

      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        }}
      />
    </Paper>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'Services Status',
      subtitle: 'Monitor health of 12 microservices',
      icon: <DnsIcon sx={{ fontSize: 28 }} />,
      color: '#2196F3',
      stats: {
        healthy: 10,
        warning: 2,
        critical: 0,
        total: 12
      },
      preview: (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {['Proxima', 'Titan', 'Orion', 'Quasar'].map(service => (
            <Chip
              key={service}
              label={service}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: '#4CAF50'
              }}
            />
          ))}
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            +8 more
          </Typography>
        </Box>
      ),
      onClick: () => navigate('/services')
    },
    {
      title: 'Databases Status',
      subtitle: 'PostgreSQL 14.9 • 12 instances',
      icon: <StorageIcon sx={{ fontSize: 28 }} />,
      color: '#4CAF50',
      stats: {
        healthy: 12,
        warning: 0,
        critical: 0,
        total: 12
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Total Storage</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>1.5 TB</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Total Records</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>589M</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Connections</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>732/1000</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/databases')
    },
    {
      title: 'Process Monitor',
      subtitle: 'Running jobs and workers',
      icon: <MemoryIcon sx={{ fontSize: 28 }} />,
      color: '#FF9800',
      stats: {
        healthy: 42,
        warning: 3,
        critical: 0,
        total: 45
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">CPU Usage</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>47.3%</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Memory</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>28.5 GB</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Active Jobs</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>8 running</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/processes')
    },
    {
      title: 'Governance Framework',
      subtitle: 'Governance framework processes',
      icon: <AccountTreeIcon sx={{ fontSize: 28 }} />,
      color: '#00BCD4',
      stats: {
        healthy: 5,
        warning: 11,
        critical: 0,
        total: 18
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Production</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>5 processes</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Active</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>2 processes</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Basic</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>11 processes</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/cobit')
    },
    {
      title: 'Cost Calculator',
      subtitle: 'Infrastructure cost estimation',
      icon: <CalculateIcon sx={{ fontSize: 28 }} />,
      color: '#9C27B0',
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Monthly Cost</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>$2,600</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Customers</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>1.11M</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Per Customer</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>$0.002</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/calculator')
    },
    {
      title: 'Documentation Portal',
      subtitle: 'API docs & technical guides',
      icon: <MenuBookIcon sx={{ fontSize: 28 }} />,
      color: '#FF5722',
      stats: {
        healthy: 14,
        warning: 0,
        critical: 0,
        total: 14
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">API Specs</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>14 services</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Guides</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>8 documents</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Last Build</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Success</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/docs-viewer')
    },
    {
      title: 'Business Documentation',
      subtitle: 'Governance, processes & guides',
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
      color: '#1e88e5',
      stats: {
        processes: 45,
        guides: 25,
        policies: 18,
        total: 88
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <Chip label="Governance" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            <Chip label="Architecture" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Documents</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>88 files</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/business-docs')
    },
    {
      title: 'Platform Dashboard',
      subtitle: 'Microservices architecture overview',
      icon: <DashboardIcon sx={{ fontSize: 28 }} />,
      color: '#00ACC1',
      stats: {
        healthy: 5,
        warning: 1,
        critical: 0,
        total: 6
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Services</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>6 running</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Avg CPU</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>52%</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Avg Memory</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>61%</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/platform-dashboard')
    },
    {
      title: 'Bill of Materials',
      subtitle: 'Components & dependencies inventory',
      icon: <ListAltIcon sx={{ fontSize: 28 }} />,
      color: '#E91E63',
      stats: {
        components: 5,
        dependencies: 16,
        critical: 5,
        total: 21
      },
      preview: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Components</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>5 modules</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Dependencies</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>16 packages</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Coverage</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>82%</Typography>
          </Box>
        </Box>
      ),
      onClick: () => navigate('/bill-of-materials')
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 4,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center', color: 'white' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Galaxy Platform
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Technical Operations Dashboard
          </Typography>
        </Box>

        {/* Tiles Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {tiles.map((tile, index) => (
            <DashboardTile key={index} {...tile} />
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6, textAlign: 'center', color: 'white', opacity: 0.7 }}>
          <Typography variant="body2">
            Real-time monitoring and management for Galaxy core banking infrastructure
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;