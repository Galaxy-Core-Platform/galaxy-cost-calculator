import React from 'react';
// @ts-ignore - react-router-dom v7 types issue
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LandingPage from './components/LandingPage';
import ServicesStatus from './components/ServicesStatus';
import DatabasesStatus from './components/DatabasesStatus';
import ProcessesView from './components/ProcessesView';
import CobitProcesses from './components/CobitProcesses';
import CostCalculatorStyled from './components/CostCalculatorStyled';
import DocumentationPortal from './components/DocumentationPortal';
import BusinessDocumentation from './components/BusinessDocumentation';
import ApiDocViewer from './components/ApiDocViewer';
import DocumentationViewer from './components/DocumentationViewer';
import GalaxyPlatformDashboard from './components/GalaxyPlatformDashboard';
import BillOfMaterials from './components/BillOfMaterials';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function AppWithRouter() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesStatus />} />
          <Route path="/databases" element={<DatabasesStatus />} />
          <Route path="/processes" element={<ProcessesView />} />
          <Route path="/cobit" element={<CobitProcesses />} />
          <Route path="/calculator" element={<CostCalculatorStyled />} />
          <Route path="/documentation" element={<DocumentationPortal />} />
          <Route path="/docs-viewer" element={<DocumentationViewer />} />
          <Route path="/business-docs" element={<BusinessDocumentation />} />
          <Route path="/api-doc/:service" element={<ApiDocViewer />} />
          <Route path="/platform-dashboard" element={<BillOfMaterials />} />
          <Route path="/bill-of-materials" element={<GalaxyPlatformDashboard />} />
          <Route path="/service-bom/:service" element={<BillOfMaterials />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default AppWithRouter;