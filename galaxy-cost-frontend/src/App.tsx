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
  Grid,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import CostCalculator from './components/CostCalculator';
import CostResults from './components/CostResults';
import CloudComparison from './components/CloudComparison';
import { CostEstimate } from './types';

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
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(false);

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
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              12 Microservices | Multi-Cloud Support
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Header */}
            <Grid size={12}>
              <Paper sx={{ p: 3, background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)' }}>
                <Typography variant="h1" color="white" gutterBottom>
                  Infrastructure Cost Calculator
                </Typography>
                <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                  Estimate costs for the complete Galaxy banking platform across AWS, GCP, and Azure
                </Typography>
              </Paper>
            </Grid>

            {/* Calculator Form */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Configuration
                </Typography>
                <CostCalculator 
                  onCalculate={setCostEstimate}
                  setLoading={setLoading}
                />
              </Paper>
            </Grid>

            {/* Results Display */}
            <Grid size={{ xs: 12, md: 8 }}>
              {costEstimate ? (
                <CostResults 
                  estimate={costEstimate}
                  loading={loading}
                />
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <CloudIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary">
                      Configure parameters and calculate costs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Select customer count, architecture, and cloud provider
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>

            {/* Cloud Comparison */}
            {costEstimate && (
              <Grid size={12}>
                <CloudComparison estimate={costEstimate} />
              </Grid>
            )}

            {/* Service List */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Galaxy Platform Services
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { name: 'Proxima', desc: 'Core Banking Ledger' },
                    { name: 'Titan', desc: 'Transaction Processing' },
                    { name: 'Orion', desc: 'Customer Service' },
                    { name: 'Quasar', desc: 'KYC/AML Verification' },
                    { name: 'Krypton', desc: 'Collateral Management' },
                    { name: 'Aster', desc: 'Approval Workflows' },
                    { name: 'Polaris', desc: 'Configuration Service' },
                    { name: 'Draco', desc: 'RBAC Service' },
                    { name: 'Nebula', desc: 'Contact Logs' },
                    { name: 'Aphelion', desc: 'Analytics' },
                    { name: 'Pulsar', desc: 'Webhooks' },
                    { name: 'Horizon', desc: 'BackOffice UI' },
                  ].map((service) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={service.name}>
                      <Box sx={{ 
                        p: 1.5, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {service.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {service.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;