import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OperationsData {
  totalPerMonth: number;
  writePerMonth: number;
  readPerMonth: number;
  dataGbPerMonth: number;
  opsPerSecond: number;
}

interface ServiceData {
  operations: number;
  data_gb: number;
  read_ops: number;
  write_ops: number;
}

interface Props {
  operations: OperationsData;
  services?: Record<string, ServiceData>;
}

const OperationsOverview: React.FC<Props> = ({ operations, services }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatOps = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K ops/s`;
    return `${num.toFixed(1)} ops/s`;
  };

  // Prepare service data for chart
  const serviceChartData = services
    ? Object.entries(services)
        .map(([name, data]) => ({
          name,
          operations: data.operations / 1000000, // Convert to millions
          data: data.data_gb,
        }))
        .sort((a, b) => b.operations - a.operations)
        .slice(0, 6) // Top 6 services
    : [];

  const readWriteRatio = operations.totalPerMonth > 0
    ? (operations.readPerMonth / operations.totalPerMonth) * 100
    : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Operations Overview
      </Typography>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ 
          flex: '1 1 180px',
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Total Operations/Month
          </Typography>
          <Typography variant="h5" color="primary">
            {formatNumber(operations.totalPerMonth)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 180px',
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Operations/Second
          </Typography>
          <Typography variant="h5" color="secondary">
            {formatOps(operations.opsPerSecond)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 180px',
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Write Operations
          </Typography>
          <Typography variant="h5">
            {formatNumber(operations.writePerMonth)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 180px',
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Read Operations
          </Typography>
          <Typography variant="h5">
            {formatNumber(operations.readPerMonth)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 180px',
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Data Volume/Month
          </Typography>
          <Typography variant="h5" color="success.main">
            {operations.dataGbPerMonth.toFixed(1)} GB
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Read/Write Ratio */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Typography variant="h6" gutterBottom>
            Read/Write Ratio
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Read Operations</Typography>
              <Typography variant="body2">{readWriteRatio.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={readWriteRatio} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">Write Operations</Typography>
              <Typography variant="body2">{(100 - readWriteRatio).toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100 - readWriteRatio} 
              color="secondary"
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Performance Implications:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Read-heavy workload benefits from caching and CDN<br />
              • Write operations require more database IOPS<br />
              • {operations.dataGbPerMonth.toFixed(1)} GB/month data growth<br />
              • {(operations.dataGbPerMonth * 12).toFixed(1)} GB/year storage needed
            </Typography>
          </Box>
        </Box>

        {/* Top Services by Volume */}
        {serviceChartData.length > 0 && (
          <Box sx={{ flex: '1 1 400px' }}>
            <Typography variant="h6" gutterBottom>
              Top Services by Volume
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}M ops`} />
                <Bar dataKey="operations" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {/* Data Growth Projection */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Growth Projection
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper sx={{ flex: '1 1 150px', p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary">
              Daily
            </Typography>
            <Typography variant="h6">
              {(operations.dataGbPerMonth / 30).toFixed(1)} GB
            </Typography>
          </Paper>
          <Paper sx={{ flex: '1 1 150px', p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary">
              Monthly
            </Typography>
            <Typography variant="h6">
              {operations.dataGbPerMonth.toFixed(1)} GB
            </Typography>
          </Paper>
          <Paper sx={{ flex: '1 1 150px', p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary">
              Quarterly
            </Typography>
            <Typography variant="h6">
              {(operations.dataGbPerMonth * 3).toFixed(1)} GB
            </Typography>
          </Paper>
          <Paper sx={{ flex: '1 1 150px', p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary">
              Annually
            </Typography>
            <Typography variant="h6">
              {(operations.dataGbPerMonth * 12 / 1000).toFixed(2)} TB
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
};

export default OperationsOverview;