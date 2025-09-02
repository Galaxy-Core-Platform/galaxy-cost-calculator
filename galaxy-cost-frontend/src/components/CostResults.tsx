import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Grid,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CostEstimate } from '../types';

interface Props {
  estimate: CostEstimate;
  loading: boolean;
}

const CostResults: React.FC<Props> = ({ estimate, loading }) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const pieData = Object.entries(estimate.components)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      value: value,
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B',
    '#4ECDC4', '#95E1D3', '#F38181', '#FFEAA7'
  ];

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Calculating costs...
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <>
      {/* Cost Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4">Cost Estimate</Typography>
              <Chip 
                label={estimate.provider.toUpperCase()} 
                color="primary" 
                size="small"
              />
              <Chip 
                label={`${(estimate.customerCount / 1000).toFixed(0)}K Customers`} 
                variant="outlined" 
                size="small"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Monthly Cost
              </Typography>
              <Typography variant="h3" color="primary.main">
                {formatCurrency(estimate.monthlyCost)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Annual Cost
              </Typography>
              <Typography variant="h3">
                {formatCurrency(estimate.annualCost)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Per Customer/Month
              </Typography>
              <Typography variant="h3" color="secondary.main">
                ${estimate.costPerCustomer.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Breakdown Chart */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Cost Breakdown
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mt: 2 }}>
              {pieData.slice(0, 8).map((item, index) => (
                <Box 
                  key={item.name}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'grey.50'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: 0.5
                      }} 
                    />
                    <Typography variant="body2">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default CostResults;