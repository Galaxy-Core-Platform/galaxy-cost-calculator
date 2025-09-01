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
git clone https://github.com/yourusername/galaxy-cost-calculator.git
cd galaxy-cost-calculator

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Basic Cost Estimation

```bash
# Run complete model (all 12 services)
python3 galaxy_complete_cost_model.py galaxy_config.yaml

# Compare architectures
python3 galaxy_complete_cost_model.py galaxy_config.yaml --compare

# Generate HTML reports
python3 generate_reports.py
```

### Configuration

Edit `galaxy_config.yaml` to customize:
```yaml
customer_count: 100000  # Number of banking customers
architecture_variant: single_region_3az  # or multi_region_3az
backup_retention_days: 30
log_retention_days: 90
```

### Available Models

1. **galaxy_complete_cost_model.py** - Complete 12-service model (RECOMMENDED)
2. **galaxy_cost_model.py** - Partial 7-service model
3. **cost_model.py** - Generic banking model for comparison
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

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

---

*Built for the Galaxy Platform - A modern microservices-based core banking system*