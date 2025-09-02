import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CostEstimate } from '../types';

interface Props {
  estimate: CostEstimate;
}

const CloudComparison: React.FC<Props> = ({ estimate }) => {
  const [comparison, setComparison] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching comparison data
    const baseCosts = {
      AWS: 68100,
      GCP: 41660,
      Azure: 97690,
    };

    const scaleFactor = estimate.customerCount / 100000;
    const archMultiplier = estimate.architecture === 'multi_region_3az' ? 2.5 : 1;

    const data = Object.entries(baseCosts).map(([provider, base]) => ({
      provider,
      monthlyCost: base * scaleFactor * archMultiplier * 1.4, // Including non-prod
      costPerCustomer: (base * scaleFactor * archMultiplier * 1.4) / estimate.customerCount,
    }));

    setComparison(data);
  }, [estimate]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const cheapest = comparison.reduce((min, item) => 
    item.monthlyCost < min.monthlyCost ? item : min, 
    comparison[0] || {}
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Multi-Cloud Comparison
      </Typography>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparison}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="provider" />
          <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="monthlyCost" fill="#8884d8" name="Monthly Cost" />
        </BarChart>
      </ResponsiveContainer>

      {/* Comparison Table */}
      <TableContainer sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell align="right">Monthly Cost</TableCell>
              <TableCell align="right">Annual Cost</TableCell>
              <TableCell align="right">Per Customer</TableCell>
              <TableCell align="right">vs Cheapest</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparison.map((row) => {
              const diff = ((row.monthlyCost / cheapest.monthlyCost - 1) * 100);
              const isLowest = row.provider === cheapest.provider;
              
              return (
                <TableRow key={row.provider}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.provider}
                      {isLowest && (
                        <Chip 
                          label="LOWEST" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={isLowest ? 'bold' : 'normal'}>
                      {formatCurrency(row.monthlyCost)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.monthlyCost * 12)}
                  </TableCell>
                  <TableCell align="right">
                    ${row.costPerCustomer.toFixed(2)}/mo
                  </TableCell>
                  <TableCell align="right">
                    {isLowest ? (
                      <Chip label="Baseline" size="small" />
                    ) : (
                      <Typography color="error.main">
                        +{diff.toFixed(1)}%
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Recommendations */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>
        <Typography variant="body2">
          • <strong>GCP offers the best value</strong> at ${(41660 * estimate.customerCount / 100000).toFixed(0)}/month
          <br />
          • Potential savings of ${((68100 - 41660) * estimate.customerCount / 100000).toFixed(0)}/month by choosing GCP over AWS
          <br />
          • GCP includes IOPS and has competitive observability pricing
          <br />
          • Consider AWS for the broadest service ecosystem and region coverage
        </Typography>
      </Box>
    </Paper>
  );
};

export default CloudComparison;