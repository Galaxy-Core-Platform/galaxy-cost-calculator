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
  Button,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Badge,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DiagramIcon from '@mui/icons-material/AccountTree';
import axios from 'axios';

interface CobitProcess {
  process_id: string;
  cobit_ref: string;
  name: string;
  category: string;
  status: string;
  description: string;
  checklist_path: string | null;
  diagram_path: string | null;
  process_doc_path: string | null;
  maturity_level: string;
  last_run: string | null;
  next_run: string | null;
  execution_time_minutes: number;
  success_rate: number;
}

const CobitProcesses: React.FC = () => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<CobitProcess[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await axios.get('/api/cobit/processes');
      setProcesses(response.data.processes);
      setSummary(response.data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching governance processes:', error);
      setLoading(false);
    }
  };

  const handleProcessAction = async (processId: string, action: string) => {
    setActionLoading(`${processId}-${action}`);
    try {
      const response = await axios.post(`/api/cobit/process/${processId}/${action}`);
      if (response.data.success) {
        // Refresh processes list
        await fetchProcesses();
      }
    } catch (error) {
      console.error(`Error executing ${action} on process ${processId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'scheduled': return '#FF9800';
      case 'stopped': return '#9e9e9e';
      case 'failed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getMaturityColor = (level: string) => {
    switch (level) {
      case 'production': return 'success';
      case 'active': return 'primary';
      case 'basic': return 'warning';
      case 'placeholder': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'governance': '🏛️',
      'management': '📊',
      'development': '⚙️',
      'operations': '🔧'
    };
    return icons[category] || '📋';
  };

  const filterProcessesByTab = () => {
    switch (tabValue) {
      case 0: return processes; // All
      case 1: return processes.filter(p => p.status === 'running');
      case 2: return processes.filter(p => p.status === 'scheduled');
      case 3: return processes.filter(p => p.status === 'completed');
      case 4: return processes.filter(p => p.maturity_level === 'production');
      default: return processes;
    }
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
            <AccountTreeIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Governance Framework Processes
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <IconButton sx={{ color: 'white' }} onClick={fetchProcesses}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            Galaxy Platform governance and management processes
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {/* Summary Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PlayArrowIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Running
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.running || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active processes
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Scheduled
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.scheduled || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending execution
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.completed || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Successfully finished
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Production
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.by_maturity?.production || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ready processes
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label={<Badge badgeContent={processes.length} color="primary">All Processes</Badge>} />
                <Tab label={<Badge badgeContent={summary?.running || 0} color="success">Running</Badge>} />
                <Tab label={<Badge badgeContent={summary?.scheduled || 0} color="warning">Scheduled</Badge>} />
                <Tab label={<Badge badgeContent={summary?.completed || 0} color="primary">Completed</Badge>} />
                <Tab label={<Badge badgeContent={summary?.by_maturity?.production || 0} color="success">Production</Badge>} />
              </Tabs>
            </Paper>

            {/* Processes Table */}
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>COBIT ID</TableCell>
                      <TableCell>Process</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Maturity</TableCell>
                      <TableCell align="right">Success Rate</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Documents</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterProcessesByTab().map((process) => (
                      <TableRow key={process.process_id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {process.cobit_ref}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {process.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {process.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${getCategoryIcon(process.category)} ${process.category}`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={process.status}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(process.status)}22`,
                              color: getStatusColor(process.status),
                              borderColor: getStatusColor(process.status),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={process.maturity_level}
                            size="small"
                            color={getMaturityColor(process.maturity_level) as any}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {process.success_rate > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <LinearProgress
                                variant="determinate"
                                value={process.success_rate}
                                sx={{
                                  width: 60,
                                  height: 4,
                                  mr: 1,
                                  borderRadius: 2,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: process.success_rate > 90 ? 'success.main' : 
                                            process.success_rate > 80 ? 'warning.main' : 'error.main',
                                  },
                                }}
                              />
                              <Typography variant="body2">
                                {process.success_rate.toFixed(1)}%
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {process.last_run || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {process.next_run || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {process.process_doc_path && (
                              <Tooltip title={`Process Document: ${process.process_doc_path.split('/').pop()}`}>
                                <IconButton 
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/governance/document?path=${encodeURIComponent(process.process_doc_path || '')}`);
                                      const text = await response.text();
                                      const newWindow = window.open('', '_blank');
                                      if (newWindow) {
                                        newWindow.document.write(`
                                          <html>
                                            <head>
                                              <title>${process.name} - Process Document</title>
                                              <style>
                                                body { 
                                                  margin: 0; 
                                                  padding: 20px; 
                                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                  line-height: 1.6;
                                                  background: #f5f5f5;
                                                }
                                                .container {
                                                  max-width: 900px;
                                                  margin: 0 auto;
                                                  background: white;
                                                  padding: 30px;
                                                  border-radius: 8px;
                                                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                                }
                                                h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                                                h2 { color: #555; margin-top: 30px; }
                                                h3 { color: #666; }
                                                pre { 
                                                  background: #f4f4f4; 
                                                  padding: 15px; 
                                                  border-radius: 5px; 
                                                  overflow-x: auto;
                                                }
                                                code { 
                                                  background: #f4f4f4; 
                                                  padding: 2px 5px; 
                                                  border-radius: 3px;
                                                  font-family: 'Courier New', monospace;
                                                }
                                                ul, ol { margin-left: 20px; }
                                                blockquote {
                                                  border-left: 4px solid #667eea;
                                                  margin: 20px 0;
                                                  padding-left: 20px;
                                                  color: #666;
                                                }
                                              </style>
                                            </head>
                                            <body>
                                              <div class="container">
                                                <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                              </div>
                                            </body>
                                          </html>
                                        `);
                                        newWindow.document.close();
                                      }
                                    } catch (error) {
                                      console.error('Error loading document:', error);
                                    }
                                  }}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <DescriptionIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {process.checklist_path && (
                              <Tooltip title={`Checklist: ${process.checklist_path.split('/').pop()}`}>
                                <IconButton 
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/governance/document?path=${encodeURIComponent(process.checklist_path || '')}`);
                                      const text = await response.text();
                                      const newWindow = window.open('', '_blank');
                                      if (newWindow) {
                                        newWindow.document.write(`
                                          <html>
                                            <head>
                                              <title>${process.name} - Checklist</title>
                                              <style>
                                                body { 
                                                  margin: 0; 
                                                  padding: 20px; 
                                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                  line-height: 1.6;
                                                  background: #f5f5f5;
                                                }
                                                .container {
                                                  max-width: 900px;
                                                  margin: 0 auto;
                                                  background: white;
                                                  padding: 30px;
                                                  border-radius: 8px;
                                                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                                }
                                                h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                                                h2 { color: #555; margin-top: 30px; }
                                                pre { 
                                                  background: #f4f4f4; 
                                                  padding: 15px; 
                                                  border-radius: 5px; 
                                                  overflow-x: auto;
                                                  white-space: pre-wrap;
                                                }
                                                ul { list-style-type: none; padding-left: 0; }
                                                ul li:before { content: "☐ "; margin-right: 10px; }
                                              </style>
                                            </head>
                                            <body>
                                              <div class="container">
                                                <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                              </div>
                                            </body>
                                          </html>
                                        `);
                                        newWindow.document.close();
                                      }
                                    } catch (error) {
                                      console.error('Error loading checklist:', error);
                                    }
                                  }}
                                  sx={{ color: 'success.main' }}
                                >
                                  <ChecklistIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {process.diagram_path && (
                              <Tooltip title={`Diagram: ${process.diagram_path.split('/').pop()?.replace('.puml', '.png')}`}>
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    const imageUrl = `/api/governance/document?path=${encodeURIComponent(process.diagram_path || '')}`;
                                    // Create a simple HTML page that displays the image
                                    const newWindow = window.open('', '_blank');
                                    if (newWindow) {
                                      newWindow.document.write(`
                                        <html>
                                          <head>
                                            <title>${process.name} - Diagram</title>
                                            <style>
                                              body { margin: 0; padding: 20px; background: #f5f5f5; }
                                              img { max-width: 100%; height: auto; display: block; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                                              h2 { font-family: Arial, sans-serif; text-align: center; }
                                            </style>
                                          </head>
                                          <body>
                                            <h2>${process.name} - Process Diagram</h2>
                                            <img src="${imageUrl}" alt="${process.name} Diagram" />
                                          </body>
                                        </html>
                                      `);
                                      newWindow.document.close();
                                    }
                                  }}
                                  sx={{ color: 'info.main' }}
                                >
                                  <DiagramIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!process.process_doc_path && !process.checklist_path && !process.diagram_path && (
                              <Typography variant="caption" color="text.secondary">
                                No docs
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {process.status !== 'running' && (
                              <Tooltip title="Run Process">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleProcessAction(process.process_id, 'run')}
                                  disabled={actionLoading === `${process.process_id}-run`}
                                >
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {process.status === 'running' && (
                              <Tooltip title="Stop Process">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleProcessAction(process.process_id, 'stop')}
                                  disabled={actionLoading === `${process.process_id}-stop`}
                                >
                                  <StopIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {process.maturity_level !== 'production' && (
                              <Tooltip title="Delete Process">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleProcessAction(process.process_id, 'delete')}
                                  disabled={actionLoading === `${process.process_id}-delete`}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Category Distribution */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Process Categories
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {Object.entries(summary?.by_category || {}).map(([category, count]) => (
                  <Box key={category} sx={{ textAlign: 'center' }}>
                    <Typography variant="h3">{getCategoryIcon(category)}</Typography>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Typography variant="h5">{count as number}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default CobitProcesses;