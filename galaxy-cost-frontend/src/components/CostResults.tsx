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
    <Box>
      {/* Cost Summary */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h5">Cost Estimate</Typography>
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

          <Grid size={4}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Monthly Cost
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
                {formatCurrency(estimate.monthlyCost)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={4}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Annual Cost
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(estimate.annualCost)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={4}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Per Customer/Month
              </Typography>
              <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 600 }}>
                ${estimate.costPerCustomer.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Breakdown Chart */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Cost Breakdown
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={6}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          <Grid size={6}>
            <Box>
              {pieData.slice(0, 8).map((item, index) => (
                <Box 
                  key={item.name}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    backgroundColor: 'grey.50',
                    fontSize: '0.875rem'
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
                    <Typography variant="caption">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight="600">
                    {formatCurrency(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CostResults;