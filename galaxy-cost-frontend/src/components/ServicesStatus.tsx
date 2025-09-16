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
  Avatar,
  Alert,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

interface ServiceInfo {
  service_name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime_percent: number;
  response_time_ms: number;
  requests_per_min: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  version: string;
  last_deploy: string;
  region: string;
  instances: number;
  alerts: number;
  last_health_check?: string;
  health_check_error?: boolean;
  health_details?: {
    uptime_seconds?: number;
    [key: string]: any;
  };
}

const ServicesStatus: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services/status');
      const servicesData = response.data.services;
      
      // Perform real health checks for each service
      const servicesWithHealth = await Promise.all(
        servicesData.map(async (service: any) => {
          try {
            const healthResponse = await axios.get(`/api/services/health/${service.service_name}`);
            const healthData = healthResponse.data;
            
            // Update service status based on real health check
            return {
              ...service,
              status: healthData.status === 'healthy' ? 'healthy' : 
                      healthData.status === 'degraded' ? 'warning' : 'critical',
              response_time_ms: healthData.response_time_ms || service.response_time_ms,
              last_health_check: new Date().toISOString(),
              health_details: healthData.details,
              health_check_error: healthData.status !== 'healthy' && healthData.status !== 'degraded'
            };
          } catch (error) {
            // If health check fails, mark as critical
            return {
              ...service,
              status: 'critical',
              last_health_check: new Date().toISOString(),
              health_check_error: true
            };
          }
        })
      );
      
      // Update summary based on real health checks
      const healthyCnt = servicesWithHealth.filter(s => s.status === 'healthy').length;
      const warningCnt = servicesWithHealth.filter(s => s.status === 'warning').length;
      const criticalCnt = servicesWithHealth.filter(s => s.status === 'critical').length;
      
      setServices(servicesWithHealth);
      setSummary({
        ...response.data.summary,
        healthy: healthyCnt,
        warning: warningCnt,
        critical: criticalCnt
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 'critical':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const formatUptime = (percent: number) => {
    if (percent >= 99.9) return '99.9%';
    return `${percent.toFixed(2)}%`;
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
            <DnsIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Services Health Monitor
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            Real-time monitoring of 12 microservices
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
                      <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Healthy Services
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.healthy_count || 0}/{summary?.total_services || 0}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(summary?.healthy_count / summary?.total_services) * 100 || 0}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      color="success"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.avg_response_time || 0}ms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P95: {summary?.p95_response_time || 0}ms
                    </Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Requests
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.total_requests_per_min || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      requests/min
                    </Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Active Alerts
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {summary?.total_alerts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across all services
                    </Typography>
                  </CardContent>
                </Card>
            </Box>

            {/* Services Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
              {services.map((service) => (
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      borderTop: `4px solid ${getStatusColor(service.status)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* Service Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getStatusColor(service.status)}22`,
                          color: getStatusColor(service.status),
                          mr: 2,
                        }}
                      >
                        {getStatusIcon(service.status)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{service.service_name}</Typography>
                          {service.last_health_check && (
                            <Chip
                              label="LIVE"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: service.health_check_error ? 'error.main' : 'success.main',
                                color: 'white',
                                animation: service.health_check_error ? 'none' : 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.6 },
                                  '100%': { opacity: 1 },
                                }
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          v{service.version} • {service.instances} instances
                          {service.health_details && service.health_details.uptime_seconds && 
                            ` • Up ${Math.floor(service.health_details.uptime_seconds / 3600)}h`}
                        </Typography>
                      </Box>
                      {service.alerts > 0 && (
                        <Chip
                          label={`${service.alerts} alerts`}
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>

                    {/* Metrics */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Uptime
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatUptime(service.uptime_percent)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Response Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {service.response_time_ms}ms
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Requests/min
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {service.requests_per_min}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {service.error_rate.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Resource Usage */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <MemoryIcon sx={{ fontSize: 14, mr: 0.5 }} /> CPU
                        </Typography>
                        <Typography variant="caption">{service.cpu_usage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={service.cpu_usage}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: service.cpu_usage > 80 ? 'error.main' : 
                                    service.cpu_usage > 60 ? 'warning.main' : 'success.main',
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon sx={{ fontSize: 14, mr: 0.5 }} /> Memory
                        </Typography>
                        <Typography variant="caption">{service.memory_usage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={service.memory_usage}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: service.memory_usage > 80 ? 'error.main' : 
                                    service.memory_usage > 60 ? 'warning.main' : 'success.main',
                          },
                        }}
                      />
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="caption" color="text.secondary">
                        Last deploy: {service.last_deploy} • {service.region}
                      </Typography>
                    </Box>
                  </Paper>
              ))}
            </Box>

            {/* Alerts Section */}
            {summary?.recent_alerts && summary.recent_alerts.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recent Alerts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {summary.recent_alerts.map((alert: any, index: number) => (
                    <Alert
                      key={index}
                      severity={alert.severity}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{alert.service}</Typography>
                        <Typography variant="body2">{alert.message}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ ml: 2 }}>
                        {alert.timestamp}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              </Paper>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ServicesStatus;