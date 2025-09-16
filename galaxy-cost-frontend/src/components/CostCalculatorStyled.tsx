import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
// @ts-ignore - react-router-dom v7 types issue
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalculateIcon from '@mui/icons-material/Calculate';
import SettingsIcon from '@mui/icons-material/Settings';
import SegmentCalculator from './SegmentCalculator';
import CostResults from './CostResults';
import CloudComparison from './CloudComparison';
import SegmentBreakdown from './SegmentBreakdown';
import OperationsOverview from './OperationsOverview';
import ConfigEditor from './ConfigEditor';

const CostCalculatorStyled: React.FC = () => {
  const navigate = useNavigate();
  const [costEstimate, setCostEstimate] = useState<any | null>(null);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  const handleCostCalculation = (data: any) => {
    setCostEstimate(data);
  };

  const handleComparisonUpdate = (data: any) => {
    setComparisonData(data);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header - matching style with other components */}
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
            <CalculateIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Infrastructure Cost Calculator
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setShowConfigEditor(true)}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Edit YAML Config
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, ml: 7 }}>
            Galaxy Platform cloud infrastructure cost estimation
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3 }}>
          {/* Left Panel - Configuration */}
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Customer Segments Configuration
            </Typography>
            <SegmentCalculator onCalculate={handleCostCalculation} setLoading={() => {}} />
          </Paper>

          {/* Right Panel - Results */}
          <Box>
            {costEstimate ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Top Row - Cost and Operations */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Cost Breakdown
                    </Typography>
                    <CostResults estimate={costEstimate} loading={false} />
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Operations Metrics
                    </Typography>
                    <OperationsOverview operations={costEstimate?.operations} />
                  </Paper>
                </Box>

                {/* Segment Breakdown */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Segment Analysis
                  </Typography>
                  <SegmentBreakdown segments={costEstimate?.segments} />
                </Paper>

                {/* Cloud Comparison */}
                <Paper sx={{ p: 3 }}>
                  <CloudComparison estimate={costEstimate} />
                </Paper>
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Configure customer segments and click Calculate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Results will appear here after calculation
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>

      {/* Configuration Editor Dialog */}
      <ConfigEditor 
        open={showConfigEditor} 
        onClose={() => setShowConfigEditor(false)} 
      />
    </Box>
  );
};

export default CostCalculatorStyled;