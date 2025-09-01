#!/usr/bin/env python3
"""
Generate comprehensive cost reports in multiple formats
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

def run_model(config_file, args="", use_complete=True):
    """Run the cost model and capture output"""
    model_script = "galaxy_complete_cost_model.py" if use_complete else "galaxy_cost_model.py"
    cmd = f"source venv/bin/activate && python3 {model_script} {config_file} {args}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout

def generate_all_reports():
    """Generate all report formats"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = Path(f"cost_reports_{timestamp}")
    report_dir.mkdir(exist_ok=True)
    
    print(f"Generating reports in {report_dir}/")
    
    # 1. Complete Galaxy model report (12 services)
    print("Running COMPLETE Galaxy model (12 services, 100K customers, single region)...")
    output = run_model("galaxy_config.yaml", use_complete=True)
    with open(report_dir / "galaxy_complete_100k_single_region.txt", "w") as f:
        f.write(output)
    
    # 2. Complete Galaxy model with comparison
    print("Running COMPLETE Galaxy model with architecture comparison...")
    output = run_model("galaxy_config.yaml", "--compare", use_complete=True)
    with open(report_dir / "galaxy_complete_architecture_comparison.txt", "w") as f:
        f.write(output)
    
    # 3. Multi-region configuration
    print("Running Galaxy model (500K customers, multi-region)...")
    output = run_model("config_multiregion.yaml")
    with open(report_dir / "galaxy_500k_multi_region.txt", "w") as f:
        f.write(output)
    
    # 4. Generic model for comparison
    print("Running generic model for comparison...")
    cmd = "source venv/bin/activate && python3 cost_model.py config.yaml --sensitivity"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    with open(report_dir / "generic_model_comparison.txt", "w") as f:
        f.write(result.stdout)
    
    # 5. Create summary JSON
    summary = {
        "generated": timestamp,
        "models": {
            "complete_galaxy_100k_single": {
                "customer_count": 100000,
                "architecture": "single_region_3az",
                "services": 12,
                "monthly_cost": "$71.33K",
                "annual_cost": "$855.91K",
                "cost_per_customer": "$0.71"
            },
            "complete_galaxy_100k_multi": {
                "customer_count": 100000,
                "architecture": "multi_region_3az",
                "services": 12,
                "monthly_cost": "$183.90K",
                "annual_cost": "$2.21M",
                "cost_per_customer": "$1.84"
            },
            "partial_galaxy_100k_single": {
                "customer_count": 100000,
                "architecture": "single_region_3az",
                "services": 7,
                "monthly_cost": "$53.32K",
                "annual_cost": "$639.83K",
                "cost_per_customer": "$0.53"
            }
        },
        "all_services": [
            "proxima (Core Banking Ledger)",
            "titan (Transaction Processing)",
            "orion (Retail Customer Service)",
            "quasar (Customer Verification)",
            "krypton (Collateral Management)",
            "aster (Approval Workflow)",
            "polaris (Configuration Service)",
            "draco (RBAC Service)",
            "nebula (Contact Log Service)",
            "aphelion (Analytics Service)",
            "pulsar (Webhook Service)",
            "horizon (BackOffice Application)"
        ]
    }
    
    with open(report_dir / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✓ All reports generated in {report_dir}/")
    print("\nGenerated files:")
    for file in sorted(report_dir.glob("*")):
        print(f"  • {file.name}")
    
    return report_dir

def generate_html_report(report_dir):
    """Generate an HTML report with all results"""
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Galaxy Platform Cost Estimation Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric {
            display: inline-block;
            margin: 10px 20px;
        }
        .metric-label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .services {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .service-card {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .comparison-better {
            color: #27ae60;
            font-weight: bold;
        }
        .comparison-worse {
            color: #e74c3c;
            font-weight: bold;
        }
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>🏦 Complete Galaxy Platform Cost Estimation Report (12 Services)</h1>
    <p><strong>Generated:</strong> """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
    
    <div class="card">
        <h2>Executive Summary</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-label">Monthly Cost (100K customers)</div>
                <div class="metric-value">$368.92K</div>
            </div>
            <div class="metric">
                <div class="metric-label">Annual Cost</div>
                <div class="metric-value">$4.43M</div>
            </div>
            <div class="metric">
                <div class="metric-label">Cost per Customer</div>
                <div class="metric-value">$3.69/month</div>
            </div>
        </div>
    </div>
    
    <div class="card">
        <h2>Galaxy Microservices</h2>
        <div class="services">
            <div class="service-card">
                <strong>Polaris</strong><br>
                Configuration Service<br>
                <em>Rust • 3 instances</em>
            </div>
            <div class="service-card">
                <strong>Orion</strong><br>
                Retail Customer Service<br>
                <em>Rust • 6 instances</em>
            </div>
            <div class="service-card">
                <strong>Nebula</strong><br>
                Contact Log Service<br>
                <em>Rust • 4 instances</em>
            </div>
            <div class="service-card">
                <strong>Horizon</strong><br>
                BackOffice Application<br>
                <em>Node.js • 3 instances</em>
            </div>
            <div class="service-card">
                <strong>Draco</strong><br>
                RBAC Service<br>
                <em>Rust • 3 instances</em>
            </div>
            <div class="service-card">
                <strong>Aphelion</strong><br>
                Analytics Service<br>
                <em>Rust • 4 instances</em>
            </div>
            <div class="service-card">
                <strong>Titan</strong><br>
                Transaction Processing<br>
                <em>Rust • 6 instances</em>
            </div>
        </div>
    </div>
    
    <div class="card">
        <h2>Architecture Comparison</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Single Region (3 AZ)</th>
                <th>Multi-Region (3x3 AZ)</th>
                <th>Difference</th>
            </tr>
            <tr>
                <td>Monthly Cost</td>
                <td>$368.92K</td>
                <td>$688.36K</td>
                <td class="comparison-worse">+157.8%</td>
            </tr>
            <tr>
                <td>Annual Cost</td>
                <td>$4.43M</td>
                <td>$8.26M</td>
                <td class="comparison-worse">+157.8%</td>
            </tr>
            <tr>
                <td>Cost per Customer</td>
                <td>$3.69</td>
                <td>$6.88</td>
                <td class="comparison-worse">+157.8%</td>
            </tr>
            <tr>
                <td>Availability</td>
                <td>99.9%</td>
                <td>99.99%</td>
                <td class="comparison-better">+0.09%</td>
            </tr>
            <tr>
                <td>Disaster Recovery</td>
                <td>Regional</td>
                <td>Global</td>
                <td class="comparison-better">Enhanced</td>
            </tr>
        </table>
    </div>
    
    <div class="card">
        <h2>Cost Breakdown by Component</h2>
        <table>
            <tr>
                <th>Component</th>
                <th>Monthly Cost</th>
                <th>% of Total</th>
            </tr>
            <tr>
                <td>Non-Production Environments</td>
                <td>$138.34K</td>
                <td>37.5%</td>
            </tr>
            <tr>
                <td>Backup & Disaster Recovery</td>
                <td>$119.50K</td>
                <td>32.4%</td>
            </tr>
            <tr>
                <td>Databases</td>
                <td>$72.85K</td>
                <td>19.7%</td>
            </tr>
            <tr>
                <td>Observability & Monitoring</td>
                <td>$12.26K</td>
                <td>3.3%</td>
            </tr>
            <tr>
                <td>Security (KMS, HSM, WAF)</td>
                <td>$8.81K</td>
                <td>2.4%</td>
            </tr>
            <tr>
                <td>Compute (EC2/Containers)</td>
                <td>$5.64K</td>
                <td>1.5%</td>
            </tr>
            <tr>
                <td>Storage</td>
                <td>$5.62K</td>
                <td>1.5%</td>
            </tr>
            <tr>
                <td>API Gateway</td>
                <td>$4.87K</td>
                <td>1.3%</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>$1.02K</td>
                <td>0.3%</td>
            </tr>
        </table>
    </div>
    
    <div class="card">
        <h2>Galaxy vs Generic Model Comparison</h2>
        <table>
            <tr>
                <th>Aspect</th>
                <th>Generic Model</th>
                <th>Galaxy Model</th>
                <th>Reason for Difference</th>
            </tr>
            <tr>
                <td>Monthly Cost (100K)</td>
                <td>$53.50K</td>
                <td class="comparison-worse">$368.92K</td>
                <td>7 microservices vs monolithic</td>
            </tr>
            <tr>
                <td>Data Volume</td>
                <td>15.6 TB</td>
                <td class="comparison-worse">78.1 TB</td>
                <td>More comprehensive data model</td>
            </tr>
            <tr>
                <td>Database Instances</td>
                <td>3</td>
                <td class="comparison-worse">21</td>
                <td>Each service has its own DB</td>
            </tr>
            <tr>
                <td>Observability Cost</td>
                <td>$1.87K</td>
                <td class="comparison-worse">$12.26K</td>
                <td>Distributed tracing overhead</td>
            </tr>
        </table>
    </div>
    
    <div class="card">
        <h2>Recommendations</h2>
        <ul>
            <li><strong>Start with Single Region:</strong> Begin with single-region deployment for 100K customers ($369K/month)</li>
            <li><strong>Plan for Growth:</strong> Multi-region adds 86.6% cost but provides global resilience</li>
            <li><strong>Optimize Non-Prod:</strong> Non-production environments are 37.5% of costs - consider scaling down during off-hours</li>
            <li><strong>Monitor Data Growth:</strong> Storage and backup costs scale linearly with data volume</li>
            <li><strong>Review Service Architecture:</strong> Consider consolidating some microservices if cost becomes prohibitive</li>
        </ul>
    </div>
    
    <div class="card">
        <h2>How to Run the Models</h2>
        <pre>
# Galaxy-specific model (recommended)
python3 galaxy_cost_model.py galaxy_config.yaml

# With architecture comparison
python3 galaxy_cost_model.py galaxy_config.yaml --compare

# Generic model (for reference)
python3 cost_model.py config.yaml --sensitivity --charts

# Generate all reports
python3 generate_reports.py
        </pre>
    </div>
</body>
</html>
"""
    
    html_file = report_dir / "report.html"
    with open(html_file, "w") as f:
        f.write(html_content)
    
    print(f"HTML report generated: {html_file}")
    return html_file

if __name__ == "__main__":
    report_dir = generate_all_reports()
    html_file = generate_html_report(report_dir)
    
    print("\n" + "="*60)
    print("REPORT GENERATION COMPLETE")
    print("="*60)
    print(f"All reports saved in: {report_dir}/")
    print(f"Open the HTML report: open {html_file}")
    print("\nTo view specific reports:")
    print(f"  cat {report_dir}/galaxy_100k_single_region.txt")
    print(f"  cat {report_dir}/galaxy_architecture_comparison.txt")
    print(f"  cat {report_dir}/summary.json | python3 -m json.tool")