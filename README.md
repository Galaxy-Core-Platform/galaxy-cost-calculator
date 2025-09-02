# Galaxy Platform Cost Calculator

A comprehensive infrastructure cost estimation model for the Galaxy core banking platform, providing accurate cost projections based on actual service architectures and database schemas.

## Overview

This calculator estimates infrastructure costs for running the complete Galaxy banking platform with all 12 microservices. It provides realistic cost estimates based on:
- Actual database schemas and data volumes
- Real service architectures (Rust/Node.js microservices)
- Cloud provider pricing models
- Customer scaling scenarios

## Key Features

- **Complete Service Coverage**: Models all 12 Galaxy platform services
- **Realistic Data Estimates**: Based on actual database schemas (158KB per customer)
- **Architecture Variants**: Single-region vs Multi-region deployments
- **Scaling Analysis**: Cost projections for 10K to 1M+ customers
- **HTML Reports**: Interactive cost breakdown visualizations

## Cost Summary (100K Customers)

| Metric | Single Region | Multi-Region |
|--------|--------------|--------------|
| Monthly Cost | $71.33K | $183.90K |
| Annual Cost | $855.91K | $2.21M |
| Per Customer/Month | $0.71 | $1.84 |

## Galaxy Services Included

### Core Banking
- **Proxima** - Core Banking Ledger
- **Titan** - Transaction Processing

### Customer Services
- **Orion** - Retail Customer Service
- **Quasar** - Customer Verification (KYC/AML)

### Risk & Compliance
- **Krypton** - Collateral Management
- **Aster** - Approval Workflow Engine

### Configuration & Security
- **Polaris** - Configuration Service
- **Draco** - RBAC Service

### Data & Analytics
- **Nebula** - Contact Log Service
- **Aphelion** - Analytics Service

### Integration & UI
- **Pulsar** - Webhook Service
- **Horizon** - BackOffice Application

## Installation

```bash
# Clone the repository
git clone https://github.com/Galaxy-Core-Platform/galaxy-cost-calculator.git
cd galaxy-cost-calculator

# Set up Python environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install pyyaml matplotlib numpy
# Or use requirements file
pip install -r requirements.txt
```

## Quick Start

```bash
# Run the calculator for 100K customers
python3 galaxy_complete_cost_model.py galaxy_config.yaml

# Generate HTML reports
python3 generate_reports.py
open cost_reports_*/report.html
```

## Detailed Usage Guide

### 1. Basic Cost Calculation

```bash
# Get cost for default configuration (100K customers, single region)
python3 galaxy_complete_cost_model.py galaxy_config.yaml
```

**Output Example:**
```
TOTAL MONTHLY COST............         $71.33K
TOTAL ANNUAL COST.............        $855.91K
Cost per Customer/Month.......           $0.71
```

### 2. Architecture Comparison

```bash
# Compare single-region vs multi-region deployments
python3 galaxy_complete_cost_model.py galaxy_config.yaml --compare
```

This shows side-by-side comparison:
- Single Region: $71.33K/month
- Multi-Region: $183.90K/month (+157.8%)

### 3. Generate Comprehensive Reports

```bash
# Generate all reports (HTML, JSON, text)
python3 generate_reports.py

# View the HTML report in browser
open cost_reports_*/report.html

# View JSON summary
cat cost_reports_*/summary.json | python3 -m json.tool
```

### 4. Customize for Different Scenarios

#### Change Customer Count
Edit `galaxy_config.yaml`:
```yaml
customer_count: 500000  # Change from 100000 to 500000
```

#### Switch to Multi-Region Architecture
```yaml
architecture_variant: multi_region_3az  # Change from single_region_3az
```

#### Adjust Retention Policies
```yaml
backup_retention_days: 60  # Increase from 30 days
log_retention_days: 365    # Increase from 90 days
```

### 5. Pre-configured Scenarios

```bash
# Small bank (10K customers) - Edit galaxy_config.yaml
python3 galaxy_complete_cost_model.py galaxy_config.yaml
# Result: ~$15K/month

# Medium bank (100K customers) - Default
python3 galaxy_complete_cost_model.py galaxy_config.yaml
# Result: ~$71K/month

# Large bank (500K customers) - Use multi-region config
python3 galaxy_complete_cost_model.py config_multiregion.yaml
# Result: ~$184K/month

# Enterprise (1M customers) - Edit config for 1M
python3 galaxy_complete_cost_model.py galaxy_config.yaml
# Result: ~$450K/month
```

### 6. Analyze Data Volumes

```bash
# See detailed data breakdown by service
python3 realistic_data_calculator.py
```

Shows:
- Data per customer: 158 KB
- Per service breakdown
- Scaling projections

### 7. Command Options

| Command | Description | Example |
|---------|-------------|---------|
| Basic calculation | Calculate costs for configuration | `python3 galaxy_complete_cost_model.py galaxy_config.yaml` |
| `--compare` | Compare single vs multi-region | `python3 galaxy_complete_cost_model.py galaxy_config.yaml --compare` |
| `--no-nonprod` | Exclude non-production costs | `python3 galaxy_complete_cost_model.py galaxy_config.yaml --no-nonprod` |

### 8. Understanding the Output

The calculator provides detailed breakdowns:

```
COST BREAKDOWN (Monthly)
----------------------------------------------------------------------
Database......................         $27.16K ( 38.1%)  # Highest cost
Non Production................         $20.38K ( 28.6%)  # Dev/test environments
Observability.................         $14.61K ( 20.5%)  # Monitoring
Security......................          $3.03K (  4.2%)  # KMS, HSM, WAF
Compute.......................          $2.90K (  4.1%)  # EC2/containers
```

### 9. Complete Workflow Example

```bash
# 1. Clone and setup
git clone https://github.com/Galaxy-Core-Platform/galaxy-cost-calculator.git
cd galaxy-cost-calculator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Customize configuration
vi galaxy_config.yaml  # Set your customer count

# 3. Run cost estimation
python3 galaxy_complete_cost_model.py galaxy_config.yaml

# 4. Compare architectures
python3 galaxy_complete_cost_model.py galaxy_config.yaml --compare

# 5. Generate full report package
python3 generate_reports.py

# 6. Open interactive report
open cost_reports_*/report.html
```

### 10. Tips and Best Practices

- **Always use `galaxy_complete_cost_model.py`** - It includes all 12 services with accurate data
- **HTML reports** are best for presentations and stakeholder reviews
- **JSON output** (`summary.json`) is ideal for automation and integration
- **Adjust pricing** in `pricing_tables.py` to match your cloud provider's rates
- **Data estimates** are based on actual Galaxy database schemas (very accurate)
- **Non-production environments** add ~40% to costs - use `--no-nonprod` to see production-only costs

### Available Models

1. **galaxy_complete_cost_model.py** - Complete 12-service model (✅ RECOMMENDED)
2. **galaxy_cost_model.py** - Partial 7-service model (legacy)
3. **cost_model.py** - Generic banking model (for comparison)
4. **realistic_data_calculator.py** - Data volume analysis tool

## Cost Breakdown

For 100K customers (single region):
- Database: $27.16K/month (38.1%)
- Non-Production: $20.38K/month (28.6%)
- Observability: $14.61K/month (20.5%)
- Security: $3.03K/month (4.2%)
- Compute: $2.90K/month (4.1%)
- Other: $3.25K/month (4.5%)

## Data Model

Based on actual Galaxy database schemas:
- **Per Customer**: ~158 KB total
  - Proxima (Ledger): 250 KB
  - Titan (Transactions): 121.5 KB
  - Orion (Customer): 9.5 KB
  - Other services: ~35 KB
- **Total with overhead**: ~62 GB for 100K customers

## Architecture Assumptions

- **Compute**: 26 total instances across 12 services
- **Databases**: PostgreSQL (small/medium/large tiers)
- **High Availability**: 3 instances per critical service
- **Caching**: Redis for 6 services
- **Queuing**: Kafka/SQS for transaction processing
- **Monitoring**: Full APM, metrics, logs, tracing

## Customization

### Modify Pricing
Edit `pricing_tables.py` to update vendor pricing:
```python
PRICING = {
    "compute": {
        "vcpu_hour": 0.04,
        "memory_gb_hour": 0.005,
        ...
    }
}
```

### Add New Services
Edit `galaxy_complete_cost_model.py` to add services:
```python
GALAXY_SERVICES = {
    "new_service": {
        "name": "New Service",
        "type": "rust",
        "instances": 2,
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        ...
    }
}
```

## Output Formats

- **Terminal Output**: Detailed cost breakdown
- **HTML Reports**: Interactive visualizations
- **JSON Summary**: Machine-readable cost data
- **Text Reports**: Detailed comparisons

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Updated cloud pricing data
- New service additions
- Performance optimizations
- Additional cloud providers

## 🚀 Deployment

For production deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md):
- Docker & Docker Compose
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Kubernetes

Quick deploy with Docker:
```bash
./deploy.sh
```

## 🌐 Web Frontend

Interactive web interface available! See [FRONTEND_README.md](FRONTEND_README.md) for details:
- Real-time cost calculations
- Interactive charts and visualizations
- Multi-cloud comparison
- Service breakdown analysis

Start the web app:
```bash
./run_app.sh
```
Then open http://localhost:3000

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

---

*Built for the Galaxy Platform - A modern microservices-based core banking system*