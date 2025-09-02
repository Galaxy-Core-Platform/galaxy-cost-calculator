import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import axios from 'axios';

interface SegmentConfig {
  retail: number;
  sme: number;
  corporate: number;
}

interface Props {
  onCalculate: (estimate: any) => void;
  setLoading: (loading: boolean) => void;
}

const SegmentCalculator: React.FC<Props> = ({ onCalculate, setLoading }) => {
  const [segments, setSegments] = useState<SegmentConfig>({
    retail: 1000000,
    sme: 100000,
    corporate: 10000,
  });

  const [architecture, setArchitecture] = useState('single_region_3az');
  const [provider, setProvider] = useState('gcp');
  const [includeNonProd, setIncludeNonProd] = useState(true);
  const [volumeMultiplier, setVolumeMultiplier] = useState(1.0);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const totalCustomers = segments.retail + segments.sme + segments.corporate;

  const handleSegmentChange = (segment: keyof SegmentConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value) || 0;
    setSegments({ ...segments, [segment]: value });
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (provider === 'all') {
        // Compare all providers
        const response = await axios.post('/api/compare-segment', {
          ...segments,
          architecture,
          includeNonProd,
          volumeMultiplier,
        });
        
        onCalculate({
          ...response.data,
          provider: 'all',
          totalCustomers,
        });
      } else {
        // Single provider calculation
        const response = await axios.post('/api/calculate-segment', {
          ...segments,
          architecture,
          provider,
          includeNonProd,
          volumeMultiplier,
        });
        
        onCalculate(response.data);
      }
    } catch (err) {
      setError('Failed to calculate costs. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSegmentPercentage = (segment: number): number => {
    return totalCustomers > 0 ? (segment / totalCustomers) * 100 : 0;
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
        <Tab label="Customer Segments" />
        <Tab label="Architecture" />
        <Tab label="Advanced" />
      </Tabs>

      {/* Customer Segments Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Configure customer segments with different transaction patterns
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Retail Segment */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(33, 150, 243, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Retail Customers</Typography>
                <Chip 
                  label={`${getSegmentPercentage(segments.retail).toFixed(1)}%`}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Individual customers • ~100 transactions/month • 2 contacts/month
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={segments.retail}
                onChange={handleSegmentChange('retail')}
                label="Number of Retail Customers"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                InputProps={{
                  inputProps: { min: 0, step: 10000 }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formatNumber(segments.retail)} customers
              </Typography>
            </Paper>

            {/* SME Segment */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StoreIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">SME Customers</Typography>
                <Chip 
                  label={`${getSegmentPercentage(segments.sme).toFixed(1)}%`}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Small/Medium enterprises • ~500 transactions/month • 8 contacts/month
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={segments.sme}
                onChange={handleSegmentChange('sme')}
                label="Number of SME Customers"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                InputProps={{
                  inputProps: { min: 0, step: 1000 }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formatNumber(segments.sme)} customers
              </Typography>
            </Paper>

            {/* Corporate Segment */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Corporate Customers</Typography>
                <Chip 
                  label={`${getSegmentPercentage(segments.corporate).toFixed(1)}%`}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Large corporations • ~5,000 transactions/month • 20 contacts/month
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={segments.corporate}
                onChange={handleSegmentChange('corporate')}
                label="Number of Corporate Customers"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                InputProps={{
                  inputProps: { min: 0, step: 100 }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formatNumber(segments.corporate)} customers
              </Typography>
            </Paper>

            {/* Total Summary */}
            <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
              <Typography variant="h6">Total Customers</Typography>
              <Typography variant="h4" color="primary">
                {formatNumber(totalCustomers)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Retail
                  </Typography>
                  <Typography variant="body2">
                    {getSegmentPercentage(segments.retail).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    SME
                  </Typography>
                  <Typography variant="body2">
                    {getSegmentPercentage(segments.sme).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Corporate
                  </Typography>
                  <Typography variant="body2">
                    {getSegmentPercentage(segments.corporate).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Box>
      )}

      {/* Architecture Tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Architecture</InputLabel>
            <Select
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value)}
              label="Architecture"
            >
              <MenuItem value="single_region_3az">Single Region (3 AZ)</MenuItem>
              <MenuItem value="multi_region_3az">Multi Region (3 AZ)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Cloud Provider</InputLabel>
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              label="Cloud Provider"
            >
              <MenuItem value="aws">Amazon Web Services (AWS)</MenuItem>
              <MenuItem value="gcp">Google Cloud Platform (GCP)</MenuItem>
              <MenuItem value="azure">Microsoft Azure</MenuItem>
              <MenuItem value="all">Compare All Providers</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={includeNonProd}
                onChange={(e) => setIncludeNonProd(e.target.checked)}
                color="primary"
              />
            }
            label="Include Non-Production Environments (Dev/Test)"
          />
        </Stack>
      )}

      {/* Advanced Tab */}
      {activeTab === 2 && (
        <Stack spacing={3}>
          <Box>
            <Typography gutterBottom>
              Volume Multiplier: {volumeMultiplier.toFixed(1)}x
            </Typography>
            <Slider
              value={volumeMultiplier}
              onChange={(_, value) => setVolumeMultiplier(value as number)}
              min={0.5}
              max={3.0}
              step={0.1}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1.0, label: '1x (Normal)' },
                { value: 2.0, label: '2x (Peak)' },
                { value: 3.0, label: '3x' },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Adjust transaction volumes for different scenarios (peak periods, growth, etc.)
            </Typography>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Volume Patterns by Segment:</strong>
            </Typography>
            <Typography variant="caption">
              • Retail: 100 transactions, 2 contacts/month<br />
              • SME: 500 transactions, 8 contacts/month<br />
              • Corporate: 5,000 transactions, 20 contacts/month
            </Typography>
          </Alert>
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleCalculate}
        startIcon={<CalculateIcon />}
        disabled={totalCustomers === 0}
      >
        Calculate Infrastructure Cost
      </Button>

      {totalCustomers === 0 && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Please enter at least one customer segment
        </Typography>
      )}
    </Box>
  );
};

export default SegmentCalculator;