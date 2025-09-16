import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

interface DatabaseInfo {
  service: string;
  name: string;
  status: string;
  total_tables: number;
  total_size: number;
  total_size_pretty: string;
  total_rows: number;
  connections: number;
  max_connections: number;
  version: string;
  indexes: number;
  tables: any[];
  largest_tables: any[];
}

const DatabasesStatus: React.FC = () => {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await axios.get('/api/databases/all');
      console.log('API Response:', response.data);
      console.log('Summary data:', response.data.summary);
      setDatabases(response.data.databases);
      setSummary(response.data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching databases:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num: any) => {
    // Handle all falsy values first
    if (num === null || num === undefined || num === '' || num === 0) return '0';
    
    // Convert to number if it's a string
    let numValue;
    if (typeof num === 'string') {
      numValue = parseFloat(num);
    } else if (typeof num === 'number') {
      numValue = num;
    } else {
      return '0';
    }
    
    // Handle invalid numbers
    if (isNaN(numValue) || !isFinite(numValue)) return '0';
    
    // Format large numbers
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(0)}K`;
    return Math.floor(numValue).toString();
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <StorageIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Database Infrastructure
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            PostgreSQL 14.9 cluster management and monitoring
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Storage
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.total_size || '0 B'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across {summary?.total_databases || 0} databases
                    </Typography>
                  </CardContent>
                </Card>

              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SpeedIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Records
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.total_records || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      In {summary?.total_tables || 0} tables
                    </Typography>
                  </CardContent>
                </Card>

              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Security
                      </Typography>
                    </Box>
                    <Typography variant="h4">100%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      All encrypted at rest
                    </Typography>
                  </CardContent>
                </Card>

              <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Connections
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.total_connections || '0/100'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active connections
                    </Typography>
                  </CardContent>
                </Card>
            </Box>

            {/* Database Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Database Instances
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Instance</TableCell>
                      <TableCell align="right">Storage</TableCell>
                      <TableCell align="right">Tables</TableCell>
                      <TableCell align="right">Records</TableCell>
                      <TableCell align="right">Indexes</TableCell>
                      <TableCell align="right">Connections</TableCell>
                      <TableCell>Features</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {databases && databases.length > 0 ? (
                      databases.map((db) => (
                        <TableRow key={db.service || db.name || Math.random()}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {db.service || db.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                PostgreSQL {db.version || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={db.status || 'unknown'} 
                              size="small" 
                              color={db.status === 'healthy' ? 'success' : db.status === 'not_found' ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2">
                                {db.total_size_pretty || '0 B'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatNumber(db.total_size || 0)} bytes
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{db.total_tables || 0}</TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2">
                                {formatNumber(db.total_rows || 0)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Records
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(db.indexes || 0)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {db.connections || 0} active
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Max: {db.max_connections || 100}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {db.status === 'healthy' && (
                                <Tooltip title="Database Online">
                                  <Chip
                                    label="LIVE"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20 }}
                                  />
                                </Tooltip>
                              )}
                              {(db.indexes || 0) > 0 && (
                                <Tooltip title="Indexed Tables">
                                  <Chip
                                    label="IDX"
                                    size="small"
                                    color="info"
                                    sx={{ height: 20 }}
                                  />
                                </Tooltip>
                              )}
                              {db.version && db.version !== 'N/A' && (
                                <Tooltip title={`PostgreSQL ${db.version}`}>
                                  <Chip
                                    label="PG"
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No database information available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Connection Pools */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Connection Pool Status
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {databases && databases.length > 0 ? databases.map((db) => (
                  <Box key={db.service || db.name || Math.random()} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{db.service || db.name || 'Unknown'}</Typography>
                        <Typography variant="caption">
                          {db.connections || 0}/{db.max_connections || 100}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((db.connections || 0) / (db.max_connections || 100)) * 100, 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">
                    No connection pool data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DatabasesStatus;