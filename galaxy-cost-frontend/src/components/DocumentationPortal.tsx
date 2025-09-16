import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BuildIcon from '@mui/icons-material/Build';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApiIcon from '@mui/icons-material/Api';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';

interface ApiDoc {
  service: string;
  version: string;
  path: string;
  status: 'valid' | 'warning' | 'error';
  issues?: string[];
  endpoints?: number;
  schemas?: number;
  lastModified?: string;
}

interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'error';
  message?: string;
  timestamp?: string;
  output?: string[];
}

const DocumentationPortal: React.FC = () => {
  const navigate = useNavigate();
  const [apiDocs, setApiDocs] = useState<ApiDoc[]>([]);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({ status: 'idle' });
  const [loading, setLoading] = useState(true);
  const [lintResults, setLintResults] = useState<any>(null);

  useEffect(() => {
    fetchDocumentationStatus();
  }, []);

  const fetchDocumentationStatus = async () => {
    try {
      const response = await axios.get('/api/documentation/status');
      setApiDocs(response.data.apis || []);
      // Only show build status if there's a message (from user action)
      const status = response.data.buildStatus || { status: 'idle' };
      if (!buildStatus.message && status.status === 'success') {
        // Don't show old success status on page load
        setBuildStatus({ status: 'idle' });
      } else {
        setBuildStatus(status);
      }
      setLintResults(response.data.lintResults || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documentation status:', error);
      // Use mock data if API not available
      setApiDocs(getMockApiDocs());
      setLoading(false);
    }
  };

  const getMockApiDocs = (): ApiDoc[] => [
    { service: 'Proxima', version: 'v1.0.0', path: 'apis/proxima.yaml', status: 'valid', endpoints: 45, schemas: 23 },
    { service: 'Orion', version: 'v2.0.0', path: 'apis/orion.yaml', status: 'valid', endpoints: 38, schemas: 19 },
    { service: 'Titan', version: 'v1.5.0', path: 'apis/titan.yaml', status: 'valid', endpoints: 52, schemas: 27 },
    { service: 'Nebula', version: 'v1.2.0', path: 'apis/nebula.yaml', status: 'valid', endpoints: 31, schemas: 15 },
    { service: 'Quasar', version: 'v1.0.0', path: 'apis/quasar.yaml', status: 'warning', endpoints: 28, schemas: 14, issues: ['Missing description for 2 endpoints'] },
    { service: 'Polaris', version: 'v2.1.0', path: 'apis/polaris.yaml', status: 'valid', endpoints: 42, schemas: 21 },
    { service: 'Aphelion', version: 'v1.3.0', path: 'apis/aphelion.yaml', status: 'valid', endpoints: 36, schemas: 18 },
    { service: 'Krypton', version: 'v1.0.0', path: 'apis/krypton.yaml', status: 'valid', endpoints: 25, schemas: 12 },
    { service: 'Aster', version: 'v1.1.0', path: 'apis/aster.yaml', status: 'valid', endpoints: 33, schemas: 16 },
    { service: 'Draco', version: 'v2.0.0', path: 'apis/draco.yaml', status: 'valid', endpoints: 48, schemas: 24 },
    { service: 'Pulsar', version: 'v1.0.0', path: 'apis/pulsar.yaml', status: 'valid', endpoints: 29, schemas: 14 },
    { service: 'Stellar', version: 'v1.2.0', path: 'apis/stellar.yaml', status: 'valid', endpoints: 22, schemas: 11 },
    { service: 'Luna', version: 'v1.0.0', path: 'apis/luna.yaml', status: 'valid', endpoints: 19, schemas: 9 },
    { service: 'Horizon', version: 'v3.0.0', path: 'apis/horizon.yaml', status: 'valid', endpoints: 15, schemas: 8 },
  ];

  const runLint = async () => {
    setBuildStatus({ status: 'building', message: 'Running lint checks...' });
    try {
      const response = await axios.post('/api/documentation/lint');
      setBuildStatus({
        status: response.data.success ? 'success' : 'error',
        message: response.data.message,
        timestamp: new Date().toISOString(),
        output: response.data.output
      });
      setLintResults(response.data.results);
      // Refresh docs status
      fetchDocumentationStatus();
    } catch (error) {
      setBuildStatus({
        status: 'error',
        message: 'Lint check failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  const buildDocs = async () => {
    setBuildStatus({ status: 'building', message: 'Building documentation...' });
    try {
      const response = await axios.post('/api/documentation/build');
      setBuildStatus({
        status: response.data.success ? 'success' : 'error',
        message: response.data.message,
        timestamp: new Date().toISOString(),
        output: response.data.output
      });
    } catch (error) {
      setBuildStatus({
        status: 'error',
        message: 'Build failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'warning':
        return <ErrorIcon sx={{ color: '#FF9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{ color: 'white', mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <MenuBookIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Documentation Portal
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            API specifications and technical documentation
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {/* Build Controls */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <BuildIcon sx={{ mr: 1 }} />
                  Documentation Build Tools
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={runLint}
                    disabled={buildStatus.status === 'building'}
                    sx={{ mr: 2 }}
                  >
                    Run Lint
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={buildDocs}
                    disabled={buildStatus.status === 'building'}
                  >
                    Build Docs
                  </Button>
                </Box>
              </Box>

              {buildStatus.status !== 'idle' && buildStatus.message && (
                <Alert
                  severity={
                    buildStatus.status === 'building' ? 'info' :
                    buildStatus.status === 'success' ? 'success' : 'error'
                  }
                  sx={{ mt: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {buildStatus.message || 'Documentation build successful'}
                    </Typography>
                    {buildStatus.timestamp && (
                      <Typography variant="caption">
                        {new Date(buildStatus.timestamp).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              {buildStatus.status === 'building' && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress />
                </Box>
              )}
            </Paper>

            {/* Documentation Overview */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ApiIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        API Specifications
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {apiDocs.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total services documented
                    </Typography>
                  </CardContent>
                </Card>
              
              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Valid Specs
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {apiDocs.filter(d => d.status === 'valid').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Passing validation
                    </Typography>
                  </CardContent>
                </Card>

              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CodeIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Endpoints
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {apiDocs.reduce((sum, doc) => sum + (doc.endpoints || 0), 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across all services
                    </Typography>
                  </CardContent>
                </Card>

              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Data Schemas
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {apiDocs.reduce((sum, doc) => sum + (doc.schemas || 0), 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total defined schemas
                    </Typography>
                  </CardContent>
                </Card>
            </Box>

            {/* API Documentation List */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                API Documentation
              </Typography>
              
              <List>
                {apiDocs.map((doc, index) => (
                  <React.Fragment key={doc.service}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(doc.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{doc.service}</Typography>
                            <Chip label={doc.version} size="small" />
                            {doc.status === 'warning' && (
                              <Chip
                                label="Has warnings"
                                size="small"
                                color="warning"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {doc.path} • {doc.endpoints} endpoints • {doc.schemas} schemas
                            </Typography>
                            {doc.issues && doc.issues.length > 0 && (
                              <Typography variant="caption" color="warning.main">
                                {doc.issues.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View API Documentation">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Please open the documentation portal manually:\n\nfile:///Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build/portal-index.html\n\nCopy this path and paste it in a new browser tab.');
                            }}
                          >
                            <OpenInNewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < apiDocs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Additional Resources */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <FolderIcon sx={{ mr: 1 }} />
                    Documentation Structure
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="API Specifications"
                        secondary="./apis/*.yaml - OpenAPI specifications for all services"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Content"
                        secondary="./content/ - Technical guides and documentation"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Build Output"
                        secondary="./build/ - Generated documentation site"
                      />
                    </ListItem>
                  </List>
                </Paper>

              <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<OpenInNewIcon />}
                      onClick={() => {
                        alert('Please open the documentation portal manually:\n\nfile:///Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build/portal-index.html\n\nCopy this path and paste it in a new browser tab.');
                      }}
                    >
                      Open Documentation Portal
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DescriptionIcon />}
                      onClick={() => navigate('/cobit')}
                    >
                      View Governance Docs
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ApiIcon />}
                      onClick={() => window.open('https://github.com/Galaxy-Core-Platform', '_blank')}
                    >
                      GitHub Repositories
                    </Button>
                  </Box>
                </Paper>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DocumentationPortal;