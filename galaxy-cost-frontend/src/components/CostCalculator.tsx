import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { CalculatorForm, CostEstimate } from '../types';

interface Props {
  onCalculate: (estimate: CostEstimate) => void;
  setLoading: (loading: boolean) => void;
}

const CostCalculator: React.FC<Props> = ({ onCalculate, setLoading }) => {
  const [form, setForm] = useState<CalculatorForm>({
    customerCount: 100000,
    architecture: 'single_region_3az',
    provider: 'gcp',
    includeNonProd: true,
  });

  const handleCalculate = async () => {
    setLoading(true);
    
    // Simulate API call - in production, this would call the Python backend
    setTimeout(() => {
      const baseCosts = {
        aws: { base: 68100, perCustomer: 0.68 },
        gcp: { base: 41660, perCustomer: 0.42 },
        azure: { base: 97690, perCustomer: 0.98 },
      };

      const providerCost = baseCosts[form.provider as keyof typeof baseCosts] || baseCosts.gcp;
      const scaleFactor = form.customerCount / 100000;
      const archMultiplier = form.architecture === 'multi_region_3az' ? 2.5 : 1;
      const nonProdMultiplier = form.includeNonProd ? 1.4 : 1;

      const monthlyBase = providerCost.base * scaleFactor * archMultiplier * nonProdMultiplier;

      const estimate: CostEstimate = {
        provider: form.provider.toUpperCase(),
        customerCount: form.customerCount,
        architecture: form.architecture,
        monthlyCost: monthlyBase,
        annualCost: monthlyBase * 12,
        costPerCustomer: monthlyBase / form.customerCount,
        components: {
          compute: monthlyBase * 0.041,
          database: monthlyBase * 0.381,
          storage: monthlyBase * 0.002,
          network: monthlyBase * 0.007,
          observability: monthlyBase * 0.205,
          security: monthlyBase * 0.042,
          backupDr: monthlyBase * 0.001,
          nonProduction: form.includeNonProd ? monthlyBase * 0.286 : 0,
          cacheQueue: monthlyBase * 0.011,
          apiGateway: monthlyBase * 0.025,
          cicd: monthlyBase * 0.001,
        },
      };

      onCalculate(estimate);
      setLoading(false);
    }, 1000);
  };

  const formatCustomerCount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Customer Count Slider */}
      <Box>
        <Typography gutterBottom>
          Customers: <strong>{formatCustomerCount(form.customerCount)}</strong>
        </Typography>
        <Slider
          value={form.customerCount}
          onChange={(_, value) => setForm({ ...form, customerCount: value as number })}
          min={10000}
          max={1000000}
          step={10000}
          marks={[
            { value: 10000, label: '10K' },
            { value: 250000, label: '250K' },
            { value: 500000, label: '500K' },
            { value: 1000000, label: '1M' },
          ]}
        />
      </Box>

      {/* Architecture Selection */}
      <FormControl fullWidth>
        <InputLabel>Architecture</InputLabel>
        <Select
          value={form.architecture}
          label="Architecture"
          onChange={(e) => setForm({ ...form, architecture: e.target.value as any })}
        >
          <MenuItem value="single_region_3az">Single Region (3 AZ)</MenuItem>
          <MenuItem value="multi_region_3az">Multi-Region (3x3 AZ)</MenuItem>
        </Select>
      </FormControl>

      {/* Cloud Provider */}
      <FormControl fullWidth>
        <InputLabel>Cloud Provider</InputLabel>
        <Select
          value={form.provider}
          label="Cloud Provider"
          onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
        >
          <MenuItem value="gcp">Google Cloud Platform</MenuItem>
          <MenuItem value="aws">Amazon Web Services</MenuItem>
          <MenuItem value="azure">Microsoft Azure</MenuItem>
          <MenuItem value="all">Compare All</MenuItem>
        </Select>
      </FormControl>

      {/* Non-Production Toggle */}
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={form.includeNonProd}
              onChange={(e) => setForm({ ...form, includeNonProd: e.target.checked })}
            />
          }
          label="Include Non-Production Environments"
        />
      </FormGroup>

      {/* Calculate Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<CalculateIcon />}
        onClick={handleCalculate}
      >
        Calculate Cost
      </Button>

      {/* Info Box */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Data Model:</strong> Based on actual Galaxy database schemas
          <br />
          <strong>Data per customer:</strong> ~158 KB
          <br />
          <strong>Services:</strong> 12 microservices
          <br />
          <strong>Non-Prod:</strong> +40% of production costs
        </Typography>
      </Box>
    </Box>
  );
};

export default CostCalculator;