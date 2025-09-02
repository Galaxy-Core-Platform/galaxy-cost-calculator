import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsIcon from '@mui/icons-material/Settings';
import SegmentCalculator from './components/SegmentCalculator';
import CostResults from './components/CostResults';
import CloudComparison from './components/CloudComparison';
import ConfigEditor from './components/ConfigEditor';
import SegmentBreakdown from './components/SegmentBreakdown';
import OperationsOverview from './components/OperationsOverview';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

function App() {
  const [costEstimate, setCostEstimate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <CloudIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Galaxy Platform Cost Calculator
            </Typography>
            <Chip 
              label="v2.0 - Segment Based" 
              size="small" 
              sx={{ mr: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip title="Configuration Editor">
              <IconButton 
                color="inherit" 
                onClick={() => setConfigOpen(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)' }}>
            <Typography variant="h1" color="white" gutterBottom>
              Segment-Based Cost Calculator
            </Typography>
            <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
              Model infrastructure costs for Retail, SME, and Corporate customer segments
            </Typography>
          </Paper>

          {/* Main Content */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Calculator Form */}
            <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Customer Segments
                </Typography>
                <SegmentCalculator 
                  onCalculate={setCostEstimate}
                  setLoading={setLoading}
                />
              </Paper>
            </Box>

            {/* Results Display */}
            <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
              {costEstimate ? (
                <Box>
                  <CostResults 
                    estimate={costEstimate}
                    loading={loading}
                  />
                  
                  {/* Segment Breakdown */}
                  {costEstimate.segments && (
                    <Box sx={{ mt: 3 }}>
                      <SegmentBreakdown segments={costEstimate.segments} />
                    </Box>
                  )}
                  
                  {/* Operations Overview */}
                  {costEstimate.operations && (
                    <Box sx={{ mt: 3 }}>
                      <OperationsOverview 
                        operations={costEstimate.operations}
                        services={costEstimate.serviceBreakdown}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <CloudIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary">
                      Configure customer segments to calculate costs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Define your Retail, SME, and Corporate customer distribution
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>

          {/* Cloud Comparison */}
          {costEstimate && costEstimate.provider === 'all' && (
            <Box sx={{ mt: 3 }}>
              <CloudComparison estimate={costEstimate} />
            </Box>
          )}

          {/* Service List */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Galaxy Platform Services
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              12 microservices handling different operational volumes based on customer segments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {[
                { name: 'Proxima', desc: 'Core Banking Ledger', ops: '601M/mo' },
                { name: 'Titan', desc: 'Transaction Processing', ops: '453M/mo' },
                { name: 'Orion', desc: 'Customer Service', ops: '10M/mo' },
                { name: 'Quasar', desc: 'KYC/AML Verification', ops: '2M/mo' },
                { name: 'Krypton', desc: 'Collateral Management', ops: '0.3M/mo' },
                { name: 'Aster', desc: 'Approval Workflows', ops: '2M/mo' },
                { name: 'Polaris', desc: 'Configuration Service', ops: '111M/mo' },
                { name: 'Draco', desc: 'RBAC Service', ops: '339M/mo' },
                { name: 'Nebula', desc: 'Contact Logs', ops: '7M/mo' },
                { name: 'Aphelion', desc: 'Analytics', ops: '557M/mo' },
                { name: 'Pulsar', desc: 'Webhooks', ops: '87M/mo' },
                { name: 'Horizon', desc: 'BackOffice UI', ops: '14M/mo' },
              ].map((service) => (
                <Box key={service.name} sx={{ 
                  p: 1.5, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  textAlign: 'center',
                  flex: '0 0 auto',
                  minWidth: '150px'
                }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {service.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.desc}
                  </Typography>
                  <Typography variant="caption" display="block" color="primary">
                    {service.ops}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
      
      {/* Configuration Editor Dialog */}
      <ConfigEditor open={configOpen} onClose={() => setConfigOpen(false)} />
    </ThemeProvider>
  );
}

export default App;