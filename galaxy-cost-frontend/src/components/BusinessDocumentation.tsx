import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PolicyIcon from '@mui/icons-material/Policy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

interface BusinessDoc {
  type: string;
  description?: string;
  path: string;
  file_count?: number;
  available: boolean;
  categories?: string[];
}

const BusinessDocumentation: React.FC = () => {
  const navigate = useNavigate();
  const [businessDocs, setBusinessDocs] = useState<BusinessDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDocs();
  }, []);

  const fetchBusinessDocs = async () => {
    try {
      const response = await axios.get('/api/documentation/business');
      setBusinessDocs(response.data.documents || getMockBusinessDocs());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching business docs:', error);
      setBusinessDocs(getMockBusinessDocs());
      setLoading(false);
    }
  };

  const getMockBusinessDocs = (): BusinessDoc[] => [
    {
      type: 'Governance Framework',
      description: 'COBIT-based governance processes and controls',
      path: '/governance-framework',
      available: true,
      categories: [
        'Process Definitions',
        'Control Objectives',
        'Risk Management',
        'Compliance Guidelines'
      ]
    },
    {
      type: 'Architecture Documentation',
      description: 'System architecture, design patterns, and technical specifications',
      path: '/architecture',
      available: true,
      categories: [
        'System Architecture',
        'API Design Guidelines',
        'Security Architecture',
        'Integration Patterns'
      ]
    },
    {
      type: 'User Guides',
      description: 'End-user documentation and training materials',
      path: '/user-guides',
      available: true,
      file_count: 25,
      categories: [
        'Getting Started',
        'Feature Guides',
        'Troubleshooting',
        'Best Practices'
      ]
    },
    {
      type: 'Process Documentation',
      description: 'Business processes, workflows, and procedures',
      path: '/processes',
      available: true,
      file_count: 45,
      categories: [
        'Operational Procedures',
        'Change Management',
        'Incident Response',
        'Service Delivery'
      ]
    }
  ];

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'governance framework':
        return <PolicyIcon sx={{ color: '#1976d2' }} />;
      case 'architecture documentation':
        return <AccountTreeIcon sx={{ color: '#9c27b0' }} />;
      case 'user guides':
        return <MenuBookIcon sx={{ color: '#4CAF50' }} />;
      case 'process documentation':
        return <AssessmentIcon sx={{ color: '#FF9800' }} />;
      default:
        return <FolderIcon sx={{ color: '#757575' }} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
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
            <DescriptionIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Business Documentation
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            Business processes, governance frameworks, and operational guides
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Documentation Categories */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {businessDocs.map((doc, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    {getIcon(doc.type)}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="h6">
                        {doc.type}
                      </Typography>
                      {doc.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                    {doc.available && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Available"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {doc.categories && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Categories:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {doc.categories.map((category, idx) => (
                          <Chip
                            key={idx}
                            label={category}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {doc.file_count && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      {doc.file_count} documents available
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {doc.type === 'Governance Framework' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/cobit')}
                      >
                        View Framework
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!doc.available}
                    >
                      Browse Documents
                    </Button>
                  </Box>
                </CardContent>
            </Card>
          ))}
        </Box>

        {/* Quick Links */}
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Links
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Security & Compliance"
                secondary="Security policies, compliance requirements, and audit procedures"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText
                primary="Performance Metrics"
                secondary="KPIs, SLAs, and performance measurement guidelines"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Integration Guidelines"
                secondary="API integration guides, data formats, and connectivity requirements"
              />
            </ListItem>
          </List>
        </Paper>

        {/* Documentation Tools */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Documentation Standards
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Document Templates"
                  secondary="Standardized templates for all documentation types"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Version Control"
                  secondary="All documents maintained in Git with change tracking"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Review Process"
                  secondary="Peer review and approval workflow for all documents"
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Access & Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/documentation')}
              >
                API Documentation Portal
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => window.open('http://127.0.0.1:4000', '_blank')}
              >
                Open Redocly Portal
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/cobit')}
              >
                Governance Framework
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default BusinessDocumentation;