#!/usr/bin/env python3
"""
Growth projection model for Galaxy Platform
Shows how costs evolve over time with customer growth
"""

import yaml
import argparse
import matplotlib.pyplot as plt
from typing import Dict, List
import numpy as np

def load_config(config_file: str) -> Dict:
    """Load configuration from YAML file"""
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

def calculate_costs_at_scale(customer_count: int, include_details: bool = False) -> Dict:
    """Calculate costs for a given customer count"""
    
    # Data sizing (158KB per customer)
    data_per_customer_kb = 158
    total_data_gb = (customer_count * data_per_customer_kb) / (1024 * 1024) * 1.5  # 50% overhead
    
    # Transaction rates
    transactions_per_customer_per_day = 2
    tps = (customer_count * transactions_per_customer_per_day) / 86400
    api_tps = tps * 5
    
    costs = {}
    
    # COMPUTE COSTS - scales with tiers
    if customer_count <= 10000:
        # Minimal setup
        compute_base = 500  # Small instances
        compute_scale = customer_count * 0.002
    elif customer_count <= 50000:
        # Small setup
        compute_base = 800
        compute_scale = customer_count * 0.003
    elif customer_count <= 100000:
        # Medium setup
        compute_base = 980
        compute_scale = customer_count * 0.004
    elif customer_count <= 500000:
        # Large setup - need bigger instances
        compute_base = 2000
        compute_scale = customer_count * 0.008
    else:
        # Enterprise setup
        compute_base = 5000
        compute_scale = customer_count * 0.010
    
    costs['compute'] = compute_base + compute_scale
    
    # DATABASE COSTS - scales with data and transactions
    if customer_count <= 10000:
        db_base = 200  # Small RDS instances
    elif customer_count <= 50000:
        db_base = 350
    elif customer_count <= 100000:
        db_base = 417
    elif customer_count <= 500000:
        db_base = 1200  # Need larger instances
    else:
        db_base = 3000  # Enterprise RDS
    
    # Storage scales linearly
    storage_cost = total_data_gb * 0.115
    backup_cost = total_data_gb * 7 * 0.095  # 7-day backups
    
    # IOPS scales with transactions
    iops = tps * 20
    iops_cost = iops * 0.10 if customer_count > 100000 else 0  # IOPS charges kick in at scale
    
    costs['database'] = db_base + storage_cost + backup_cost + iops_cost
    
    # OBSERVABILITY - scales with infrastructure
    num_instances = 12 if customer_count <= 10000 else \
                   24 if customer_count <= 100000 else \
                   48 if customer_count <= 500000 else 96
    
    metrics_cost = num_instances * 10 * 0.30  # 10 metrics per instance
    logs_gb = num_instances * 0.1 * 30  # 100MB per instance per day
    logs_cost = logs_gb * 0.50
    apm_cost = num_instances * 15
    
    # Add tracing at scale
    trace_cost = 0
    if customer_count > 50000:
        trace_millions = (api_tps * 86400 * 30) / 1000000
        trace_cost = trace_millions * 2.00
    
    costs['observability'] = metrics_cost + logs_cost + apm_cost + trace_cost
    
    # OTHER COSTS
    api_calls_millions = (api_tps * 86400 * 30) / 1000000
    api_gateway_cost = api_calls_millions * 3.50
    
    # Cache scales with customer base
    if customer_count <= 50000:
        cache_cost = 15  # t3.micro
    elif customer_count <= 100000:
        cache_cost = 30  # t3.small
    elif customer_count <= 500000:
        cache_cost = 120  # m5.large
    else:
        cache_cost = 480  # m5.xlarge cluster
    
    # Network transfer scales with activity
    network_gb = customer_count * 0.001 * 30  # 1MB per customer per month
    network_cost = network_gb * 0.09
    
    # Load balancer scales
    lb_cost = 20 if customer_count <= 100000 else 40 if customer_count <= 500000 else 80
    
    costs['other'] = api_gateway_cost + cache_cost + network_cost + lb_cost + 25  # +25 for queue/CI
    
    # Total production
    costs['production_total'] = sum([costs['compute'], costs['database'], 
                                     costs['observability'], costs['other']])
    
    # Non-production (scales down as you grow)
    nonprod_pct = 0.4 if customer_count <= 10000 else \
                  0.3 if customer_count <= 100000 else \
                  0.2 if customer_count <= 500000 else 0.15
    
    costs['nonproduction'] = costs['production_total'] * nonprod_pct
    costs['total_monthly'] = costs['production_total'] + costs['nonproduction']
    costs['total_annual'] = costs['total_monthly'] * 12
    costs['cost_per_customer'] = costs['total_monthly'] / customer_count if customer_count > 0 else 0
    
    if include_details:
        costs['details'] = {
            'customer_count': customer_count,
            'data_gb': total_data_gb,
            'tps': tps,
            'api_tps': api_tps,
            'instances': num_instances,
            'nonprod_pct': nonprod_pct * 100
        }
    
    return costs

def generate_growth_projection(initial_customers: int, growth_rate: float, months: int) -> List[Dict]:
    """Generate month-by-month growth projection"""
    projections = []
    
    for month in range(months + 1):
        # Calculate customer count for this month
        if month == 0:
            customers = initial_customers
        else:
            # Compound monthly growth
            customers = int(initial_customers * ((1 + growth_rate) ** month))
        
        # Calculate costs
        costs = calculate_costs_at_scale(customers, include_details=True)
        costs['month'] = month
        projections.append(costs)
    
    return projections

def print_growth_report(projections: List[Dict], growth_rate: float):
    """Print detailed growth projection report"""
    print("\n" + "="*100)
    print("GALAXY PLATFORM - COST GROWTH PROJECTION")
    print("="*100)
    print(f"Initial Customers: {projections[0]['details']['customer_count']:,}")
    print(f"Monthly Growth Rate: {growth_rate*100:.1f}%")
    print(f"Projection Period: {len(projections)-1} months")
    
    print("\n" + "-"*100)
    print(f"{'Month':<7} {'Customers':<12} {'Data(GB)':<10} {'Compute':<12} {'Database':<12} "
          f"{'Observ.':<12} {'Other':<12} {'Total/Mo':<12} {'Per Cust':<10}")
    print("-"*100)
    
    for proj in projections[::3]:  # Show every 3 months
        month = proj['month']
        details = proj['details']
        print(f"{month:<7} {details['customer_count']:<12,} {details['data_gb']:<10.1f} "
              f"${proj['compute']:<11,.0f} ${proj['database']:<11,.0f} "
              f"${proj['observability']:<11,.0f} ${proj['other']:<11,.0f} "
              f"${proj['total_monthly']:<11,.0f} ${proj['cost_per_customer']:<9.3f}")
    
    print("\n" + "="*100)
    print("KEY INSIGHTS")
    print("="*100)
    
    # Calculate key metrics
    initial = projections[0]
    final = projections[-1]
    customer_growth = (final['details']['customer_count'] / initial['details']['customer_count'] - 1) * 100
    cost_growth = (final['total_monthly'] / initial['total_monthly'] - 1) * 100
    
    print(f"Customer Growth: {customer_growth:.1f}%")
    print(f"Cost Growth: {cost_growth:.1f}%")
    print(f"Economies of Scale: Cost per customer drops from ${initial['cost_per_customer']:.3f} to ${final['cost_per_customer']:.3f}")
    
    # Identify scaling points
    print("\n" + "-"*100)
    print("SCALING MILESTONES")
    print("-"*100)
    
    milestones = [10000, 50000, 100000, 250000, 500000, 1000000]
    for milestone in milestones:
        # Find when we cross this milestone
        for proj in projections:
            if proj['details']['customer_count'] >= milestone:
                print(f"{milestone:>10,} customers: Month {proj['month']:2} - ${proj['total_monthly']:>10,.0f}/month "
                      f"(${proj['cost_per_customer']:.3f}/customer)")
                break
    
    print("\n" + "="*100)
    print("COST BREAKDOWN AT KEY POINTS")
    print("="*100)
    
    key_points = [0, 6, 12, 18, 24] if len(projections) > 24 else [0, len(projections)//2, len(projections)-1]
    
    for month_idx in key_points:
        if month_idx < len(projections):
            proj = projections[month_idx]
            details = proj['details']
            print(f"\nMonth {proj['month']} ({details['customer_count']:,} customers):")
            print(f"  Compute:       ${proj['compute']:>10,.2f} ({proj['compute']/proj['total_monthly']*100:5.1f}%)")
            print(f"  Database:      ${proj['database']:>10,.2f} ({proj['database']/proj['total_monthly']*100:5.1f}%)")
            print(f"  Observability: ${proj['observability']:>10,.2f} ({proj['observability']/proj['total_monthly']*100:5.1f}%)")
            print(f"  Other:         ${proj['other']:>10,.2f} ({proj['other']/proj['total_monthly']*100:5.1f}%)")
            print(f"  Non-Prod:      ${proj['nonproduction']:>10,.2f} ({details['nonprod_pct']:5.1f}%)")
            print(f"  TOTAL:         ${proj['total_monthly']:>10,.2f}")

def create_growth_charts(projections: List[Dict], output_file: str = 'growth_projection.png'):
    """Create visualization of growth projections"""
    months = [p['month'] for p in projections]
    customers = [p['details']['customer_count'] for p in projections]
    total_costs = [p['total_monthly'] for p in projections]
    per_customer_costs = [p['cost_per_customer'] for p in projections]
    
    # Component costs
    compute_costs = [p['compute'] for p in projections]
    database_costs = [p['database'] for p in projections]
    observability_costs = [p['observability'] for p in projections]
    other_costs = [p['other'] for p in projections]
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Customer growth
    ax1.plot(months, customers, 'b-', linewidth=2)
    ax1.set_xlabel('Month')
    ax1.set_ylabel('Customers')
    ax1.set_title('Customer Growth')
    ax1.grid(True, alpha=0.3)
    ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x/1000:.0f}K'))
    
    # Total cost growth
    ax2.plot(months, total_costs, 'g-', linewidth=2)
    ax2.set_xlabel('Month')
    ax2.set_ylabel('Monthly Cost ($)')
    ax2.set_title('Total Cost Growth')
    ax2.grid(True, alpha=0.3)
    ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1000:.0f}K'))
    
    # Cost per customer
    ax3.plot(months, per_customer_costs, 'r-', linewidth=2)
    ax3.set_xlabel('Month')
    ax3.set_ylabel('Cost per Customer ($)')
    ax3.set_title('Cost per Customer (Economies of Scale)')
    ax3.grid(True, alpha=0.3)
    
    # Stacked area chart of components
    ax4.stackplot(months, compute_costs, database_costs, observability_costs, other_costs,
                  labels=['Compute', 'Database', 'Observability', 'Other'],
                  alpha=0.8)
    ax4.set_xlabel('Month')
    ax4.set_ylabel('Monthly Cost ($)')
    ax4.set_title('Cost Components Over Time')
    ax4.legend(loc='upper left')
    ax4.grid(True, alpha=0.3)
    ax4.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1000:.0f}K'))
    
    plt.suptitle('Galaxy Platform - Cost Growth Projection', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    print(f"\nChart saved to: {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Galaxy Platform Growth Projection Model')
    parser.add_argument('--initial-customers', type=int, default=10000, 
                       help='Initial customer count (default: 10000)')
    parser.add_argument('--growth-rate', type=float, default=0.10,
                       help='Monthly growth rate (default: 0.10 = 10% per month)')
    parser.add_argument('--months', type=int, default=24,
                       help='Number of months to project (default: 24)')
    parser.add_argument('--chart', action='store_true',
                       help='Generate growth charts')
    
    args = parser.parse_args()
    
    # Generate projections
    projections = generate_growth_projection(
        args.initial_customers,
        args.growth_rate,
        args.months
    )
    
    # Print report
    print_growth_report(projections, args.growth_rate)
    
    # Create charts if requested
    if args.chart:
        create_growth_charts(projections)
    
    # Print current vs future comparison
    print("\n" + "="*100)
    print("INVESTMENT SUMMARY")
    print("="*100)
    initial = projections[0]
    year1 = projections[12] if len(projections) > 12 else projections[-1]
    year2 = projections[24] if len(projections) > 24 else projections[-1]
    
    print(f"Month 0:  {initial['details']['customer_count']:>10,} customers @ ${initial['total_monthly']:>10,.2f}/month")
    print(f"Year 1:   {year1['details']['customer_count']:>10,} customers @ ${year1['total_monthly']:>10,.2f}/month")
    print(f"Year 2:   {year2['details']['customer_count']:>10,} customers @ ${year2['total_monthly']:>10,.2f}/month")
    
    # Calculate total investment
    total_investment = sum(p['total_monthly'] for p in projections[:25])
    print(f"\nTotal 2-year infrastructure investment: ${total_investment:,.2f}")
    print(f"Average monthly cost: ${total_investment/24:,.2f}")
    print("="*100)

if __name__ == "__main__":
    main()