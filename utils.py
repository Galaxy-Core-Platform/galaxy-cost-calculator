"""
Utility functions for the cost estimation model
"""

import json
import yaml
from typing import Dict, Any
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from YAML or JSON file"""
    with open(config_path, 'r') as f:
        if config_path.endswith('.yaml') or config_path.endswith('.yml'):
            return yaml.safe_load(f)
        elif config_path.endswith('.json'):
            return json.load(f)
        else:
            raise ValueError("Config file must be YAML or JSON")

def calculate_derived_metrics(config: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate derived metrics from base configuration"""
    customers = config['customer_count']
    
    metrics = {
        'customer_count': customers,
        'architecture_variant': config['architecture_variant'],
        
        # Data volumes (in GB)
        'account_data_gb': (customers * 10) / 1024,  # 10MB per customer
        'transaction_data_gb': (customers * 50) / 1024,  # 50MB per customer per year
        'document_data_gb': (customers * 100) / 1024,  # 100MB per customer
        'total_data_gb': 0,  # Will be calculated
        
        # Transaction rates
        'base_tps': (customers / 1000) * 0.5,  # 0.5 TPS per 1000 customers
        'peak_tps': 0,  # Will be calculated
        'daily_transactions': 0,  # Will be calculated
        
        # API calls
        'daily_api_calls': customers * 120,  # 100 mobile/web + 20 third-party
        'monthly_api_calls': 0,  # Will be calculated
        
        # Backup and retention
        'backup_retention_days': config.get('backup_retention_days', 30),
        'log_retention_days': config.get('log_retention_days', 90),
        
        # Non-prod scaling
        'dev_env_scale': config.get('dev_env_scale', 0.3),
        'staging_env_scale': config.get('staging_env_scale', 0.5),
        'uat_env_scale': config.get('uat_env_scale', 0.4),
    }
    
    # Calculate derived values
    metrics['total_data_gb'] = (metrics['account_data_gb'] + 
                                metrics['transaction_data_gb'] + 
                                metrics['document_data_gb'])
    metrics['peak_tps'] = metrics['base_tps'] * 3  # 3x peak multiplier
    metrics['daily_transactions'] = metrics['base_tps'] * 86400  # seconds in a day
    metrics['monthly_api_calls'] = metrics['daily_api_calls'] * 30
    
    return metrics

def format_cost(cost: float) -> str:
    """Format cost value with proper units"""
    if cost >= 1000000:
        return f"${cost/1000000:.2f}M"
    elif cost >= 1000:
        return f"${cost/1000:.2f}K"
    else:
        return f"${cost:.2f}"

def generate_cost_breakdown_chart(costs: Dict[str, float], output_file: str = None):
    """Generate a pie chart of cost breakdown"""
    # Filter out zero costs and prepare data
    filtered_costs = {k: v for k, v in costs.items() if v > 0}
    
    if not filtered_costs:
        print("No costs to visualize")
        return
    
    labels = list(filtered_costs.keys())
    sizes = list(filtered_costs.values())
    
    # Create pie chart
    fig, ax = plt.subplots(figsize=(10, 8))
    colors = plt.cm.Set3(np.linspace(0, 1, len(labels)))
    
    wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors,
                                       autopct='%1.1f%%', startangle=90)
    
    # Enhance text
    for text in texts:
        text.set_fontsize(10)
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(9)
        autotext.set_weight('bold')
    
    ax.set_title('Infrastructure Cost Breakdown', fontsize=14, fontweight='bold')
    
    # Add legend with cost values
    legend_labels = [f"{label}: {format_cost(cost)}" 
                     for label, cost in zip(labels, sizes)]
    ax.legend(legend_labels, loc='center left', bbox_to_anchor=(1, 0.5))
    
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"Chart saved to {output_file}")
    else:
        plt.show()

def generate_scaling_chart(sensitivity_results: list, output_file: str = None):
    """Generate a line chart showing cost scaling with customer growth"""
    if not sensitivity_results:
        print("No sensitivity results to visualize")
        return
    
    # Extract data
    scenarios = [r['scenario'] for r in sensitivity_results]
    customer_counts = [r['customer_count'] for r in sensitivity_results]
    total_costs = [r['total_monthly_cost'] for r in sensitivity_results]
    
    # Create line chart
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.plot(customer_counts, total_costs, marker='o', linewidth=2, markersize=8)
    
    # Annotate points
    for i, (x, y, scenario) in enumerate(zip(customer_counts, total_costs, scenarios)):
        ax.annotate(f"{scenario}\n{format_cost(y)}", 
                   xy=(x, y), xytext=(0, 10),
                   textcoords='offset points', ha='center',
                   fontsize=9, bbox=dict(boxstyle='round,pad=0.3', 
                                       facecolor='yellow', alpha=0.3))
    
    ax.set_xlabel('Number of Customers', fontsize=12)
    ax.set_ylabel('Monthly Cost (USD)', fontsize=12)
    ax.set_title('Infrastructure Cost Scaling Analysis', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    
    # Format y-axis
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format_cost(x)))
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"{int(x):,}"))
    
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"Chart saved to {output_file}")
    else:
        plt.show()

def print_cost_report(costs: Dict[str, Any], metrics: Dict[str, Any]):
    """Print a formatted cost report"""
    print("\n" + "="*60)
    print("CORE BANKING INFRASTRUCTURE COST ESTIMATION REPORT")
    print("="*60)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Architecture: {metrics['architecture_variant'].replace('_', ' ').title()}")
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Peak TPS: {metrics['peak_tps']:.1f}")
    print(f"Total Data Volume: {metrics['total_data_gb']:.1f} GB")
    print("\n" + "-"*60)
    print("COMPONENT COST BREAKDOWN (Monthly)")
    print("-"*60)
    
    component_costs = costs.get('components', {})
    total = costs.get('total_monthly', 0)
    
    for component, cost in sorted(component_costs.items(), key=lambda x: x[1], reverse=True):
        if cost > 0:
            percentage = (cost / total * 100) if total > 0 else 0
            print(f"{component.replace('_', ' ').title():.<30} {format_cost(cost):>12} ({percentage:5.1f}%)")
    
    print("-"*60)
    print(f"{'TOTAL MONTHLY COST':.<30} {format_cost(total):>12}")
    print(f"{'TOTAL ANNUAL COST':.<30} {format_cost(costs.get('total_annual', 0)):>12}")
    print(f"{'Cost per Customer/Month':.<30} {format_cost(costs.get('cost_per_customer', 0)):>12}")
    print(f"{'Cost per Transaction':.<30} ${costs.get('cost_per_transaction', 0):.4f}")
    print("="*60)

def compare_architectures(single_region_costs: Dict, multi_region_costs: Dict):
    """Print comparison between architecture variants"""
    print("\n" + "="*60)
    print("ARCHITECTURE VARIANT COMPARISON")
    print("="*60)
    
    print(f"{'Metric':.<35} {'Single Region':>12} {'Multi-Region':>12}")
    print("-"*60)
    
    # Compare monthly costs
    sr_monthly = single_region_costs.get('total_monthly', 0)
    mr_monthly = multi_region_costs.get('total_monthly', 0)
    print(f"{'Monthly Cost':.<35} {format_cost(sr_monthly):>12} {format_cost(mr_monthly):>12}")
    
    # Compare annual costs
    sr_annual = single_region_costs.get('total_annual', 0)
    mr_annual = multi_region_costs.get('total_annual', 0)
    print(f"{'Annual Cost':.<35} {format_cost(sr_annual):>12} {format_cost(mr_annual):>12}")
    
    # Cost increase
    increase = ((mr_monthly / sr_monthly - 1) * 100) if sr_monthly > 0 else 0
    print(f"{'Multi-Region Premium':.<35} {'-':>12} {f'+{increase:.1f}%':>12}")
    
    # Component comparison
    print("\n" + "-"*60)
    print("Component Cost Comparison")
    print("-"*60)
    
    sr_components = single_region_costs.get('components', {})
    mr_components = multi_region_costs.get('components', {})
    
    all_components = set(sr_components.keys()) | set(mr_components.keys())
    
    for component in sorted(all_components):
        sr_cost = sr_components.get(component, 0)
        mr_cost = mr_components.get(component, 0)
        if sr_cost > 0 or mr_cost > 0:
            print(f"{component.replace('_', ' ').title():.<35} {format_cost(sr_cost):>12} {format_cost(mr_cost):>12}")
    
    print("="*60)