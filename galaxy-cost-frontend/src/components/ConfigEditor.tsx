import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import axios from 'axios';
import yaml from 'js-yaml';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ConfigEditor: React.FC<Props> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [volumeConfig, setVolumeConfig] = useState<string>('');
  const [awsPricing, setAwsPricing] = useState<string>('');
  const [gcpPricing, setGcpPricing] = useState<string>('');
  const [azurePricing, setAzurePricing] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadConfigurations();
    }
  }, [open]);

  const loadConfigurations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load volume configuration
      const volumeResponse = await axios.get('/api/config/volume');
      setVolumeConfig(yaml.dump(volumeResponse.data, { indent: 2 }));
      
      // Load pricing configurations
      const awsResponse = await axios.get('/api/config/pricing/aws');
      setAwsPricing(yaml.dump(awsResponse.data, { indent: 2 }));
      
      const gcpResponse = await axios.get('/api/config/pricing/gcp');
      setGcpPricing(yaml.dump(gcpResponse.data, { indent: 2 }));
      
      const azureResponse = await axios.get('/api/config/pricing/azure');
      setAzurePricing(yaml.dump(azureResponse.data, { indent: 2 }));
    } catch (err) {
      setError('Failed to load configurations');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let configData;
      let endpoint;
      let configName;
      
      switch (activeTab) {
        case 0:
          configData = yaml.load(volumeConfig);
          endpoint = '/api/config/volume';
          configName = 'Volume configuration';
          break;
        case 1:
          configData = yaml.load(awsPricing);
          endpoint = '/api/config/pricing/aws';
          configName = 'AWS pricing';
          break;
        case 2:
          configData = yaml.load(gcpPricing);
          endpoint = '/api/config/pricing/gcp';
          configName = 'GCP pricing';
          break;
        case 3:
          configData = yaml.load(azurePricing);
          endpoint = '/api/config/pricing/azure';
          configName = 'Azure pricing';
          break;
        default:
          return;
      }
      
      await axios.post(endpoint, configData);
      setSuccess(`${configName} saved successfully`);
    } catch (err: any) {
      if (err.message && err.message.includes('YAML')) {
        setError('Invalid YAML format. Please check your configuration.');
      } else {
        setError('Failed to save configuration');
      }
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadConfiguration = () => {
    let content;
    let filename;
    
    switch (activeTab) {
      case 0:
        content = volumeConfig;
        filename = 'volume_config.yaml';
        break;
      case 1:
        content = awsPricing;
        filename = 'pricing_aws.yaml';
        break;
      case 2:
        content = gcpPricing;
        filename = 'pricing_gcp.yaml';
        break;
      case 3:
        content = azurePricing;
        filename = 'pricing_azure.yaml';
        break;
      default:
        return;
    }
    
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const content = await file.text();
      // Validate YAML
      yaml.load(content);
      
      switch (activeTab) {
        case 0:
          setVolumeConfig(content);
          break;
        case 1:
          setAwsPricing(content);
          break;
        case 2:
          setGcpPricing(content);
          break;
        case 3:
          setAzurePricing(content);
          break;
      }
      
      setSuccess('File loaded successfully');
    } catch (err) {
      setError('Invalid YAML file');
    }
  };

  const getConfigContent = () => {
    switch (activeTab) {
      case 0:
        return volumeConfig;
      case 1:
        return awsPricing;
      case 2:
        return gcpPricing;
      case 3:
        return azurePricing;
      default:
        return '';
    }
  };

  const setConfigContent = (content: string) => {
    switch (activeTab) {
      case 0:
        setVolumeConfig(content);
        break;
      case 1:
        setAwsPricing(content);
        break;
      case 2:
        setGcpPricing(content);
        break;
      case 3:
        setAzurePricing(content);
        break;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Configuration Editor</Typography>
          <Box>
            <input
              type="file"
              accept=".yaml,.yml"
              style={{ display: 'none' }}
              id="upload-file"
              onChange={handleFileUpload}
            />
            <label htmlFor="upload-file">
              <Tooltip title="Upload YAML">
                <IconButton component="span" disabled={loading}>
                  <UploadIcon />
                </IconButton>
              </Tooltip>
            </label>
            <Tooltip title="Download YAML">
              <IconButton onClick={downloadConfiguration} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reload">
              <IconButton onClick={loadConfigurations} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
          <Tab label="Volume Config" />
          <Tab label="AWS Pricing" />
          <Tab label="GCP Pricing" />
          <Tab label="Azure Pricing" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Edit YAML configuration below. Changes will be validated before saving.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={20}
            value={getConfigContent()}
            onChange={(e) => setConfigContent(e.target.value)}
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            disabled={loading}
          />
        </Paper>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Tips:</strong><br />
            • Volume Config: Adjust operation volumes per customer segment<br />
            • Pricing: Update cloud provider rates (per hour, per GB, etc.)<br />
            • Use proper YAML syntax with correct indentation
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={saveConfiguration}
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Dialog>
  );
};

export default ConfigEditor;