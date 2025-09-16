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
  Badge,
  Avatar,
  Tooltip,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MemoryIcon from '@mui/icons-material/Memory';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StreamIcon from '@mui/icons-material/Stream';
import ApiIcon from '@mui/icons-material/Api';
import WorkIcon from '@mui/icons-material/Work';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

interface ProcessInfo {
  process_id: string;
  service_name: string;
  process_type: string;
  process_name: string;
  status: string;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  threads: number;
  start_time: string;
  runtime_minutes: number;
  last_heartbeat: string;
}

interface BatchJob {
  job_id: string;
  service_name: string;
  job_name: string;
  status: string;
  started_at: string;
  runtime_minutes: number;
  progress_percent: number;
  records_processed: number;
  records_total: number;
  estimated_completion: string;
}

const ProcessesView: React.FC = () => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [processesRes, batchJobsRes] = await Promise.all([
        axios.get('/api/processes/all'),
        axios.get('/api/processes/batch-jobs'),
      ]);
      setProcesses(processesRes.data.processes);
      setBatchJobs(batchJobsRes.data.batch_jobs);
      setSummary(processesRes.data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching processes:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#4CAF50';
      case 'idle':
        return '#2196F3';
      case 'stopped':
        return '#9e9e9e';
      case 'error':
        return '#f44336';
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getProcessTypeIcon = (type: string) => {
    switch (type) {
      case 'batch':
        return <ScheduleIcon />;
      case 'streaming':
        return <StreamIcon />;
      case 'api':
        return <ApiIcon />;
      case 'worker':
        return <WorkIcon />;
      default:
        return <MemoryIcon />;
    }
  };

  const formatRuntime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const hrs = hours % 24;
    return `${days}d ${hrs}h`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
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
            <MemoryIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Process Monitor
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <IconButton sx={{ color: 'white' }} onClick={fetchData}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            Running processes, batch jobs, and workers
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
                      <PlayArrowIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Running Processes
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.running_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      of {summary?.total_processes || 0} total
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MemoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        CPU Usage
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.avg_cpu_usage?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average across all processes
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Memory Usage
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {formatMemory(summary?.total_memory_mb || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total allocation
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Active Batch Jobs
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {batchJobs.filter(j => j.status === 'running').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {batchJobs.filter(j => j.status === 'completed').length} completed today
                    </Typography>
                  </CardContent>
                </Card>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab 
                  label={
                    <Badge badgeContent={processes.length} color="primary">
                      All Processes
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={batchJobs.filter(j => j.status === 'running').length} 
                      color="secondary"
                    >
                      Batch Jobs
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={processes.filter(p => p.process_type === 'worker').length} 
                      color="primary"
                    >
                      Workers
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={processes.filter(p => p.process_type === 'streaming').length} 
                      color="primary"
                    >
                      Streaming
                    </Badge>
                  } 
                />
              </Tabs>
            </Paper>

            {/* All Processes Tab */}
            {tabValue === 0 && (
              <Paper sx={{ p: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Process</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">CPU %</TableCell>
                        <TableCell align="right">Memory</TableCell>
                        <TableCell align="right">Threads</TableCell>
                        <TableCell align="right">Runtime</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {processes.map((process) => (
                        <TableRow key={process.process_id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1,
                                  bgcolor: `${getStatusColor(process.status)}22`,
                                  color: getStatusColor(process.status),
                                }}
                              >
                                {getProcessTypeIcon(process.process_type)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {process.process_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {process.process_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{process.service_name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={process.process_type} 
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
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <LinearProgress
                                variant="determinate"
                                value={process.cpu_usage_percent}
                                sx={{
                                  width: 60,
                                  height: 4,
                                  mr: 1,
                                  borderRadius: 2,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: process.cpu_usage_percent > 80 ? 'error.main' : 
                                            process.cpu_usage_percent > 60 ? 'warning.main' : 'success.main',
                                  },
                                }}
                              />
                              <Typography variant="body2">
                                {process.cpu_usage_percent}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {formatMemory(process.memory_usage_mb)}
                          </TableCell>
                          <TableCell align="right">{process.threads}</TableCell>
                          <TableCell align="right">
                            {formatRuntime(process.runtime_minutes)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {process.status === 'running' && (
                                <Tooltip title="Pause">
                                  <IconButton size="small">
                                    <PauseIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {process.status === 'idle' && (
                                <Tooltip title="Start">
                                  <IconButton size="small">
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Stop">
                                <IconButton size="small">
                                  <StopIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Batch Jobs Tab */}
            {tabValue === 1 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {batchJobs.map((job) => (
                    <Paper sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{job.job_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.service_name} • {job.job_id}
                          </Typography>
                        </Box>
                        <Chip
                          label={job.status}
                          color={job.status === 'running' ? 'primary' : 
                                job.status === 'completed' ? 'success' : 'default'}
                        />
                      </Box>

                      {job.status === 'running' && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Progress</Typography>
                              <Typography variant="body2">
                                {formatNumber(job.records_processed)} / {formatNumber(job.records_total)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={job.progress_percent}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {job.progress_percent.toFixed(1)}% complete
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Runtime
                              </Typography>
                              <Typography variant="body2">
                                {formatRuntime(job.runtime_minutes)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Est. Completion
                              </Typography>
                              <Typography variant="body2">
                                {job.estimated_completion}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      )}

                      {job.status === 'completed' && (
                        <Box>
                          <Typography variant="body2" color="success.main">
                            ✓ Processed {formatNumber(job.records_processed)} records
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed in {formatRuntime(job.runtime_minutes)}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                ))}
              </Box>
            )}

            {/* Workers Tab */}
            {tabValue === 2 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {processes
                  .filter(p => p.process_type === 'worker')
                  .map((worker) => (
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2">
                              {worker.process_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {worker.service_name}
                            </Typography>
                          </Box>
                          <Chip
                            label={worker.status}
                            size="small"
                            color={worker.status === 'running' ? 'success' : 'default'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">CPU</Typography>
                          <Typography variant="caption">{worker.cpu_usage_percent}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">Memory</Typography>
                          <Typography variant="caption">{formatMemory(worker.memory_usage_mb)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Runtime</Typography>
                          <Typography variant="caption">{formatRuntime(worker.runtime_minutes)}</Typography>
                        </Box>
                      </Paper>
                  ))}
              </Box>
            )}

            {/* Streaming Tab */}
            {tabValue === 3 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {processes
                  .filter(p => p.process_type === 'streaming')
                  .map((stream) => (
                      <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <StreamIcon sx={{ mr: 1, color: 'secondary.main' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">
                              {stream.process_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stream.service_name} • {stream.process_id}
                            </Typography>
                          </Box>
                          <Chip
                            label={stream.status}
                            color={stream.status === 'running' ? 'primary' : 'default'}
                          />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              CPU Usage
                            </Typography>
                            <Typography variant="h6">
                              {stream.cpu_usage_percent}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Memory
                            </Typography>
                            <Typography variant="h6">
                              {formatMemory(stream.memory_usage_mb)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Runtime
                            </Typography>
                            <Typography variant="h6">
                              {formatRuntime(stream.runtime_minutes)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                  ))}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProcessesView;