#!/usr/bin/env python3
"""
Galaxy Platform Multi-Cloud Cost Calculator
Supports AWS, GCP, and Azure pricing
"""

import argparse
import yaml
import sys
from typing import Dict, Any
from pathlib import Path

# Import the complete model functions
from galaxy_complete_cost_model import (
    GALAXY_SERVICES,
    calculate_complete_galaxy_metrics,
    estimate_complete_compute_cost,
    estimate_complete_database_cost,
    estimate_complete_observability_cost,
    print_complete_galaxy_report
)
from utils import format_cost, load_config

def load_cloud_pricing(provider: str) -> Dict[str, Any]:
    """Load pricing configuration for specified cloud provider"""
    pricing_files = {
        'aws': 'pricing_aws.yaml',
        'gcp': 'pricing_gcp.yaml',
        'azure': 'pricing_azure.yaml',
        'generic': None  # Use default pricing_tables.py
    }
    
    if provider.lower() not in pricing_files:
        raise ValueError(f"Unsupported cloud provider: {provider}. Choose from: aws, gcp, azure, generic")
    
    if provider.lower() == 'generic':
        # Use the default pricing from pricing_tables.py
        from pricing_tables import PRICING
        return PRICING
    
    pricing_file = pricing_files[provider.lower()]
    pricing_path = Path(pricing_file)
    
    if not pricing_path.exists():
        raise FileNotFoundError(f"Pricing file not found: {pricing_file}")
    
    with open(pricing_path, 'r') as f:
        pricing_data = yaml.safe_load(f)
    
    # Convert YAML structure to match expected format
    return {
        'provider': pricing_data.get('provider', provider.upper()),
        'region': pricing_data.get('region', 'default'),
        'currency': pricing_data.get('currency', 'USD'),
        'compute': pricing_data.get('compute', {}),
        'database': pricing_data.get('database', {}),
        'storage': pricing_data.get('storage', {}),
        'network': pricing_data.get('network', {}),
        'cache_queue': pricing_data.get('cache_queue', {}),
        'api_gateway': pricing_data.get('api_gateway', {}),
        'security': pricing_data.get('security', {}),
        'observability': pricing_data.get('observability', {}),
        'backup_dr': pricing_data.get('backup_dr', {}),
        'cicd': pricing_data.get('cicd', {}),
    }

def calculate_with_cloud_pricing(metrics: Dict, pricing: Dict) -> Dict:
    """Calculate costs using cloud-specific pricing"""
    variant = metrics['architecture_variant']
    
    # Calculate costs for each component
    component_costs = {
        'compute': estimate_complete_compute_cost(metrics, pricing, variant),
        'database': estimate_complete_database_cost(metrics, pricing, variant),
        'observability': estimate_complete_observability_cost(metrics, pricing, variant),
    }
    
    # Simplified calculations for other components
    # (In production, these would use the full estimation functions)
    component_costs['cache_queue'] = len([s for s in GALAXY_SERVICES.values() if s.get('cache') or s.get('queue')]) * 100
    component_costs['api_gateway'] = (metrics['customer_api_tps'] * 86400 * 30 / 1000000) * pricing['api_gateway']['million_requests']
    component_costs['security'] = 30 * pricing['security']['kms_key'] + pricing['security'].get('ddos_protection_advanced', 3000)
    component_costs['storage'] = metrics['total_data_gb'] * pricing['storage'].get('object_standard_gb', 0.023)
    component_costs['network'] = (metrics['customer_count'] / 1000) * 5
    component_costs['backup_dr'] = metrics['total_data_gb'] * 30 * pricing['backup_dr']['snapshot_gb']
    component_costs['cicd'] = 800 * pricing['cicd']['build_minutes'] + 300 * pricing['cicd']['artifact_storage_gb']
    
    total_monthly = sum(component_costs.values())
    
    # Add non-prod environments
    if metrics.get('include_nonprod', True):
        component_costs['non_production'] = total_monthly * 0.4
        total_monthly *= 1.4
    
    return {
        'provider': pricing.get('provider', 'Unknown'),
        'region': pricing.get('region', 'default'),
        'components': component_costs,
        'total_monthly': total_monthly,
        'total_annual': total_monthly * 12,
        'cost_per_customer': total_monthly / metrics['customer_count'] if metrics['customer_count'] > 0 else 0,
    }

def compare_cloud_providers(config: Dict[str, Any]) -> None:
    """Compare costs across AWS, GCP, and Azure"""
    metrics = calculate_complete_galaxy_metrics(config)
    metrics['include_nonprod'] = True
    
    providers = ['aws', 'gcp', 'azure']
    results = {}
    
    print("\n" + "="*80)
    print("MULTI-CLOUD COST COMPARISON - GALAXY PLATFORM")
    print("="*80)
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Architecture: {metrics['architecture_variant'].replace('_', ' ').title()}")
    print(f"Services: {len(GALAXY_SERVICES)} microservices")
    print(f"Data Volume: {metrics['total_data_gb']:.1f} GB")
    
    # Calculate costs for each provider
    for provider in providers:
        try:
            pricing = load_cloud_pricing(provider)
            costs = calculate_with_cloud_pricing(metrics, pricing)
            results[provider] = costs
        except Exception as e:
            print(f"Error calculating {provider}: {e}")
            continue
    
    if not results:
        print("No results to compare")
        return
    
    # Find cheapest provider
    cheapest = min(results.items(), key=lambda x: x[1]['total_monthly'])
    
    # Print comparison table
    print("\n" + "-"*80)
    print("COST COMPARISON BY PROVIDER")
    print("-"*80)
    print(f"{'Provider':<15} {'Region':<15} {'Monthly Cost':<15} {'Annual Cost':<15} {'Per Customer':<12} {'vs Cheapest':<12}")
    print("-"*80)
    
    for provider in providers:
        if provider in results:
            cost = results[provider]
            diff = ((cost['total_monthly'] / cheapest[1]['total_monthly']) - 1) * 100 if cheapest[1]['total_monthly'] > 0 else 0
            diff_str = f"+{diff:.1f}%" if diff > 0 else "CHEAPEST" if diff == 0 else f"{diff:.1f}%"
            
            print(f"{provider.upper():<15} {cost['region']:<15} "
                  f"{format_cost(cost['total_monthly']):<15} "
                  f"{format_cost(cost['total_annual']):<15} "
                  f"${cost['cost_per_customer']:.2f}/mo{'':<4} "
                  f"{diff_str:<12}")
    
    # Print component breakdown for each provider
    print("\n" + "-"*80)
    print("COMPONENT COST BREAKDOWN")
    print("-"*80)
    
    components = ['compute', 'database', 'storage', 'network', 'observability', 'security', 'backup_dr', 'non_production']
    
    print(f"{'Component':<20}", end="")
    for provider in providers:
        if provider in results:
            print(f"{provider.upper():>15}", end="")
    print()
    print("-"*80)
    
    for component in components:
        print(f"{component.replace('_', ' ').title():<20}", end="")
        for provider in providers:
            if provider in results:
                cost = results[provider]['components'].get(component, 0)
                print(f"{format_cost(cost):>15}", end="")
        print()
    
    print("-"*80)
    print(f"{'TOTAL':<20}", end="")
    for provider in providers:
        if provider in results:
            print(f"{format_cost(results[provider]['total_monthly']):>15}", end="")
    print()
    
    # Print recommendations
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("-"*80)
    print(f"✓ Cheapest Provider: {cheapest[0].upper()} at {format_cost(cheapest[1]['total_monthly'])}/month")
    
    # Calculate savings
    most_expensive = max(results.items(), key=lambda x: x[1]['total_monthly'])
    potential_savings = most_expensive[1]['total_monthly'] - cheapest[1]['total_monthly']
    print(f"✓ Potential Savings: {format_cost(potential_savings)}/month by choosing {cheapest[0].upper()} over {most_expensive[0].upper()}")
    
    # Provider-specific insights
    if 'gcp' in results and results['gcp']['total_monthly'] < results.get('aws', {}).get('total_monthly', float('inf')):
        print("✓ GCP offers better pricing for compute and included IOPS")
    if 'azure' in results:
        print("✓ Azure provides free inter-AZ transfer which can reduce network costs")
    if 'aws' in results:
        print("✓ AWS has the most mature service ecosystem and broadest region coverage")
    
    print("="*80)

def print_cloud_specific_report(costs: Dict, metrics: Dict):
    """Print report with cloud provider details"""
    print("\n" + "="*70)
    print(f"GALAXY PLATFORM COST ESTIMATION - {costs.get('provider', 'UNKNOWN')} CLOUD")
    print("="*70)
    print(f"Provider: {costs.get('provider', 'Unknown')}")
    print(f"Region: {costs.get('region', 'default')}")
    print(f"Architecture: {metrics['architecture_variant'].replace('_', ' ').title()}")
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Total Data Volume: {metrics['total_data_gb']:.1f} GB")
    print(f"Number of Services: {len(GALAXY_SERVICES)}")
    
    print("\n" + "-"*70)
    print("COST BREAKDOWN (Monthly)")
    print("-"*70)
    
    for component, cost in sorted(costs['components'].items(), key=lambda x: x[1], reverse=True):
        if cost > 0:
            percentage = (cost / costs['total_monthly'] * 100)
            print(f"{component.replace('_', ' ').title():.<30} {format_cost(cost):>15} ({percentage:5.1f}%)")
    
    print("-"*70)
    print(f"{'TOTAL MONTHLY COST':.<30} {format_cost(costs['total_monthly']):>15}")
    print(f"{'TOTAL ANNUAL COST':.<30} {format_cost(costs['total_annual']):>15}")
    print(f"{'Cost per Customer/Month':.<30} ${costs['cost_per_customer']:.2f}")
    print("="*70)

def main():
    """Main function for multi-cloud cost calculator"""
    parser = argparse.ArgumentParser(description='Galaxy Platform Multi-Cloud Cost Calculator')
    parser.add_argument('config', help='Path to configuration file')
    parser.add_argument('--provider', choices=['aws', 'gcp', 'azure', 'generic'], 
                       default='generic', help='Cloud provider for pricing')
    parser.add_argument('--compare', action='store_true', help='Compare all cloud providers')
    parser.add_argument('--no-nonprod', action='store_true', help='Exclude non-production costs')
    
    args = parser.parse_args()
    
    try:
        # Load configuration
        config = load_config(args.config)
        
        # If comparing, show comparison and exit
        if args.compare:
            compare_cloud_providers(config)
            return 0
        
        # Calculate metrics
        metrics = calculate_complete_galaxy_metrics(config)
        metrics['include_nonprod'] = not args.no_nonprod
        
        # Load pricing for specified provider
        pricing = load_cloud_pricing(args.provider)
        
        # Calculate costs
        costs = calculate_with_cloud_pricing(metrics, pricing)
        
        # Print report
        print_cloud_specific_report(costs, metrics)
        
        print(f"\n✓ Cost estimation completed for {args.provider.upper()}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())