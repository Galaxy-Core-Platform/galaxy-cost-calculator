import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SegmentData {
  count: number;
  percentage: number;
  operations: number;
  data_gb: number;
}

interface Props {
  segments: {
    retail: SegmentData;
    sme: SegmentData;
    corporate: SegmentData;
  };
}

const SegmentBreakdown: React.FC<Props> = ({ segments }) => {
  const COLORS = {
    retail: '#2196F3',
    sme: '#4CAF50',
    corporate: '#FF9800',
  };

  const pieData = [
    { name: 'Retail', value: segments.retail.count, color: COLORS.retail },
    { name: 'SME', value: segments.sme.count, color: COLORS.sme },
    { name: 'Corporate', value: segments.corporate.count, color: COLORS.corporate },
  ];

  const barData = [
    {
      name: 'Retail',
      operations: segments.retail.operations / 1000000,
      data: segments.retail.data_gb,
    },
    {
      name: 'SME',
      operations: segments.sme.operations / 1000000,
      data: segments.sme.data_gb,
    },
    {
      name: 'Corporate',
      operations: segments.corporate.operations / 1000000,
      data: segments.corporate.data_gb,
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Segment Analysis
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Customer Distribution */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Typography variant="h6" gutterBottom>
            Customer Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Operations & Data Volume */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Typography variant="h6" gutterBottom>
            Operations & Data Volume
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="operations" fill="#8884d8" name="Operations (M/mo)" />
              <Bar yAxisId="right" dataKey="data" fill="#82ca9d" name="Data (GB/mo)" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Segment Cards */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.entries(segments).map(([segment, data]) => (
            <Paper 
              key={segment}
              sx={{ 
                flex: '1 1 250px',
                p: 2, 
                borderLeft: `4px solid ${COLORS[segment as keyof typeof COLORS]}`,
                backgroundColor: 'grey.50'
              }}
            >
              <Typography variant="h6" textTransform="capitalize">
                {segment}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Customers
                </Typography>
                <Typography variant="h5">
                  {formatNumber(data.count)}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Operations
                </Typography>
                <Typography variant="body1">
                  {formatNumber(data.operations)}
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Data Volume
                </Typography>
                <Typography variant="body1">
                  {data.data_gb.toFixed(1)} GB/mo
                </Typography>
              </Box>
              <Chip 
                label={`${data.percentage.toFixed(1)}%`}
                size="small"
                sx={{ mt: 1 }}
                color="primary"
              />
            </Paper>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default SegmentBreakdown;