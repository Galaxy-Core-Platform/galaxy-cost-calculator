# Galaxy Cost Calculator - Web Frontend

A modern React-based web interface for the Galaxy Platform Cost Calculator, providing interactive cost estimation and multi-cloud comparison.

## Features

### 🎨 Interactive UI
- Material-UI components for professional design
- Real-time cost calculations
- Interactive sliders and forms
- Responsive layout for all devices

### 📊 Visualizations
- **Pie Charts**: Cost breakdown by component
- **Bar Charts**: Multi-cloud comparison
- **Tables**: Detailed cost analysis
- **Color-coded**: Visual indicators for cheapest options

### ☁️ Multi-Cloud Support
- AWS (Amazon Web Services)
- GCP (Google Cloud Platform)
- Azure (Microsoft Azure)
- Side-by-side comparison

### 🧮 Calculator Features
- Customer count: 10K to 1M customers
- Architecture: Single-region or Multi-region
- Non-production environments toggle
- Real-time cost updates

## Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for backend API)
- Virtual environment with dependencies

### Setup

1. **Install Backend Dependencies**
```bash
cd /Users/mifo/Desktop/galaxy-cost-calculator
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors pyyaml matplotlib numpy
```

2. **Install Frontend Dependencies**
```bash
cd galaxy-cost-frontend
npm install
```

## Running the Application

### Option 1: Using the Run Script (Recommended)
```bash
cd /Users/mifo/Desktop/galaxy-cost-calculator
./run_app.sh
```
This starts both the API server and React frontend automatically.

### Option 2: Manual Start

**Terminal 1 - Start API Server:**
```bash
cd /Users/mifo/Desktop/galaxy-cost-calculator
source venv/bin/activate
python3 api_server.py
```

**Terminal 2 - Start React Frontend:**
```bash
cd galaxy-cost-frontend
npm start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Usage Guide

### 1. Configure Parameters
- Use the slider to select customer count (10K - 1M)
- Choose architecture (Single-region or Multi-region)
- Select cloud provider (AWS, GCP, Azure, or Compare All)
- Toggle non-production environments on/off

### 2. Calculate Costs
- Click "Calculate Cost" button
- View results instantly:
  - Monthly and annual costs
  - Cost per customer
  - Component breakdown pie chart

### 3. Compare Providers
- Select "Compare All" in provider dropdown
- View side-by-side comparison
- See recommendations and potential savings

## API Endpoints

The frontend connects to these backend endpoints:

- `POST /api/calculate` - Calculate costs for specific configuration
- `POST /api/compare` - Compare costs across all providers
- `GET /api/services` - Get list of Galaxy services
- `GET /api/health` - Health check

## Project Structure

```
galaxy-cost-frontend/
├── src/
│   ├── components/
│   │   ├── CostCalculator.tsx    # Main calculator form
│   │   ├── CostResults.tsx       # Results display with charts
│   │   └── CloudComparison.tsx   # Multi-cloud comparison
│   ├── types.ts                  # TypeScript interfaces
│   └── App.tsx                   # Main application
├── public/
└── package.json
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for components
- **Recharts** for data visualization
- **Axios** for API calls

### Backend
- **Flask** REST API
- **Python** cost calculation engine
- **YAML** pricing configurations

## Features in Detail

### Cost Breakdown Visualization
- Pie chart showing percentage distribution
- Color-coded components
- Interactive tooltips with exact values

### Multi-Cloud Comparison
- Bar chart comparing monthly costs
- Table with detailed metrics
- Automatic "CHEAPEST" indicator
- Percentage difference calculations

### Service Display
- All 12 Galaxy microservices listed
- Service descriptions
- Visual grid layout

## Customization

### Modify Pricing
Edit pricing files in the backend:
- `pricing_aws.yaml`
- `pricing_gcp.yaml`
- `pricing_azure.yaml`

### Adjust UI Theme
Modify theme in `App.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});
```

### Add New Features
1. Create new component in `src/components/`
2. Import in `App.tsx`
3. Add corresponding API endpoint if needed

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

### CORS Issues
Ensure proxy is set in `package.json`:
```json
"proxy": "http://localhost:5000"
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Production Build

```bash
cd galaxy-cost-frontend
npm run build
```

The optimized production build will be in the `build/` folder.

## Screenshots

### Main Calculator
- Configuration panel on the left
- Real-time results on the right
- Service grid at the bottom

### Cost Results
- Monthly, annual, and per-customer costs
- Interactive pie chart
- Component breakdown table

### Cloud Comparison
- Bar chart visualization
- Comparison table with savings
- Recommendations section

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API server logs
3. Open an issue on GitHub

---

Built for the Galaxy Platform - A modern microservices-based core banking system