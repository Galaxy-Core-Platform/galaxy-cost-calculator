#!/usr/bin/env python3
"""
Realistic cost model for Galaxy Platform with detailed unit cost breakdown
Fixes the unrealistic high costs in the original model
"""

import yaml
import argparse
from typing import Dict

def load_config(config_file: str) -> Dict:
    """Load configuration from YAML file"""
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

def calculate_realistic_metrics(config: Dict) -> Dict:
    """Calculate realistic metrics for the Galaxy platform"""
    customer_count = config['customer_count']
    
    # Realistic data volumes (158KB per customer based on schema analysis)
    data_per_customer_kb = 158  # From realistic_data_calculator.py
    total_data_gb = (customer_count * data_per_customer_kb) / (1024 * 1024)
    
    # Add overhead for indexes, logs, etc. (50%)
    total_data_gb *= 1.5
    
    # Transaction rates (realistic for banking)
    transactions_per_customer_per_day = 2  # Average 2 transactions per day
    tps = (customer_count * transactions_per_customer_per_day) / 86400
    
    metrics = {
        'customer_count': customer_count,
        'total_data_gb': total_data_gb,
        'transaction_tps': tps,
        'api_tps': tps * 5,  # API calls are ~5x transactions
        'architecture': config['architecture_variant'],
        'backup_retention_days': config.get('backup_retention_days', 30),
        'log_retention_days': config.get('log_retention_days', 30),  # Reduced from 90
    }
    
    return metrics

def calculate_compute_costs(metrics: Dict) -> Dict:
    """Calculate realistic compute costs"""
    costs = {}
    
    # Small setup for 100K customers
    # 12 services, each with minimal instances
    if metrics['customer_count'] <= 100000:
        # Most services run on t3.medium (2 vCPU, 4GB RAM)
        # Cost: ~$30/month per instance
        regular_services = 8  # Most services
        regular_instances = 2  # 2 instances for HA
        costs['regular_services'] = {
            'count': regular_services * regular_instances,
            'type': 't3.medium',
            'unit_cost': 30,
            'total': regular_services * regular_instances * 30
        }
        
        # Core services on t3.large (2 vCPU, 8GB RAM)
        # Cost: ~$60/month per instance
        core_services = 4  # Proxima, Titan, Orion, Quasar
        core_instances = 2  # 2 instances for HA
        costs['core_services'] = {
            'count': core_services * core_instances,
            'type': 't3.large',
            'unit_cost': 60,
            'total': core_services * core_instances * 60
        }
        
        # Load balancer
        costs['load_balancer'] = {
            'count': 1,
            'unit_cost': 20,
            'total': 20
        }
    
    costs['total'] = sum(c['total'] for c in costs.values())
    return costs

def calculate_database_costs(metrics: Dict) -> Dict:
    """Calculate realistic database costs"""
    costs = {}
    
    # RDS instances - much smaller than original
    if metrics['customer_count'] <= 100000:
        # Small RDS instances for most services
        # db.t3.small: 2 vCPU, 2GB RAM (~$25/month)
        small_dbs = 8
        costs['small_databases'] = {
            'count': small_dbs,
            'type': 'db.t3.small',
            'unit_cost': 25,
            'total': small_dbs * 25
        }
        
        # Medium RDS for core services
        # db.t3.medium: 2 vCPU, 4GB RAM (~$50/month)
        medium_dbs = 4
        costs['medium_databases'] = {
            'count': medium_dbs,
            'type': 'db.t3.medium',
            'unit_cost': 50,
            'total': medium_dbs * 50
        }
        
        # Storage
        storage_gb = metrics['total_data_gb']
        costs['storage'] = {
            'gb': storage_gb,
            'unit_cost': 0.115,  # $/GB/month
            'total': storage_gb * 0.115
        }
        
        # Backups (automated, 7-day retention)
        backup_gb = storage_gb * 7
        costs['backups'] = {
            'gb': backup_gb,
            'unit_cost': 0.095,  # $/GB/month
            'total': backup_gb * 0.095
        }
    
    costs['total'] = sum(c['total'] for c in costs.values())
    return costs

def calculate_observability_costs(metrics: Dict) -> Dict:
    """Calculate realistic monitoring costs"""
    costs = {}
    
    # CloudWatch or equivalent
    # Metrics: $0.30 per metric per month
    num_instances = 24  # Total instances across all services
    metrics_per_instance = 10  # CPU, memory, disk, network, etc.
    costs['metrics'] = {
        'count': num_instances * metrics_per_instance,
        'unit_cost': 0.30,
        'total': num_instances * metrics_per_instance * 0.30
    }
    
    # Logs: $0.50 per GB ingested
    daily_logs_gb = num_instances * 0.1  # 100MB per instance per day
    monthly_logs_gb = daily_logs_gb * 30
    costs['logs'] = {
        'gb': monthly_logs_gb,
        'unit_cost': 0.50,
        'total': monthly_logs_gb * 0.50
    }
    
    # APM: $15 per host
    costs['apm'] = {
        'hosts': num_instances,
        'unit_cost': 15,
        'total': num_instances * 15
    }
    
    costs['total'] = sum(c['total'] for c in costs.values())
    return costs

def calculate_other_costs(metrics: Dict) -> Dict:
    """Calculate other infrastructure costs"""
    costs = {}
    
    # API Gateway
    api_calls_millions = (metrics['api_tps'] * 86400 * 30) / 1000000
    costs['api_gateway'] = {
        'million_requests': api_calls_millions,
        'unit_cost': 3.50,
        'total': api_calls_millions * 3.50
    }
    
    # Redis cache (single instance)
    costs['cache'] = {
        'instances': 1,
        'type': 'cache.t3.micro',
        'unit_cost': 15,
        'total': 15
    }
    
    # Message queue (SQS/Kafka)
    costs['queue'] = {
        'instances': 1,
        'unit_cost': 20,
        'total': 20
    }
    
    # Network transfer (minimal internal)
    costs['network'] = {
        'gb': 100,
        'unit_cost': 0.09,
        'total': 100 * 0.09
    }
    
    # CI/CD
    costs['cicd'] = {
        'build_minutes': 500,
        'unit_cost': 0.008,
        'total': 500 * 0.008
    }
    
    costs['total'] = sum(c['total'] for c in costs.values())
    return costs

def print_detailed_report(all_costs: Dict, metrics: Dict):
    """Print detailed cost report with unit costs"""
    print("\n" + "="*80)
    print("REALISTIC GALAXY PLATFORM COST ESTIMATION")
    print("="*80)
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Total Data: {metrics['total_data_gb']:.1f} GB")
    print(f"Transaction TPS: {metrics['transaction_tps']:.1f}")
    print(f"Architecture: {metrics['architecture']}")
    
    # Compute costs
    print("\n" + "-"*80)
    print("COMPUTE COSTS (with unit prices)")
    print("-"*80)
    compute = all_costs['compute']
    for key, details in compute.items():
        if key != 'total' and isinstance(details, dict):
            print(f"{key:25} {details['count']:3} x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
    print(f"{'Compute Total:':45} ${compute['total']:8.2f}")
    
    # Database costs
    print("\n" + "-"*80)
    print("DATABASE COSTS (with unit prices)")
    print("-"*80)
    database = all_costs['database']
    for key, details in database.items():
        if key != 'total' and isinstance(details, dict):
            if 'gb' in details:
                print(f"{key:25} {details['gb']:6.1f} GB x ${details['unit_cost']:6.3f} = ${details['total']:8.2f}")
            else:
                print(f"{key:25} {details['count']:3} x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
    print(f"{'Database Total:':45} ${database['total']:8.2f}")
    
    # Observability costs
    print("\n" + "-"*80)
    print("OBSERVABILITY COSTS (with unit prices)")
    print("-"*80)
    observability = all_costs['observability']
    for key, details in observability.items():
        if key != 'total' and isinstance(details, dict):
            if 'gb' in details:
                print(f"{key:25} {details['gb']:6.1f} GB x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
            elif 'count' in details:
                print(f"{key:25} {details['count']:3} x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
            else:
                print(f"{key:25} {details.get('hosts', 0):3} x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
    print(f"{'Observability Total:':45} ${observability['total']:8.2f}")
    
    # Other costs
    print("\n" + "-"*80)
    print("OTHER INFRASTRUCTURE COSTS (with unit prices)")
    print("-"*80)
    other = all_costs['other']
    for key, details in other.items():
        if key != 'total' and isinstance(details, dict):
            if 'million_requests' in details:
                print(f"{key:25} {details['million_requests']:6.1f}M x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
            elif 'gb' in details:
                print(f"{key:25} {details['gb']:6.1f} GB x ${details['unit_cost']:6.3f} = ${details['total']:8.2f}")
            elif 'build_minutes' in details:
                print(f"{key:25} {details['build_minutes']:3} min x ${details['unit_cost']:6.3f} = ${details['total']:8.2f}")
            else:
                print(f"{key:25} {details.get('instances', 1):3} x ${details['unit_cost']:6.2f} = ${details['total']:8.2f}")
    print(f"{'Other Total:':45} ${other['total']:8.2f}")
    
    # Summary
    print("\n" + "="*80)
    print("COST SUMMARY")
    print("="*80)
    
    total_production = sum(c['total'] for c in all_costs.values())
    
    print(f"{'Compute:':30} ${all_costs['compute']['total']:12,.2f}")
    print(f"{'Database:':30} ${all_costs['database']['total']:12,.2f}")
    print(f"{'Observability:':30} ${all_costs['observability']['total']:12,.2f}")
    print(f"{'Other Infrastructure:':30} ${all_costs['other']['total']:12,.2f}")
    print("-"*80)
    print(f"{'PRODUCTION TOTAL:':30} ${total_production:12,.2f}/month")
    
    # Add non-production (dev/test)
    nonprod = total_production * 0.3  # 30% for dev/test
    print(f"{'Non-Production (30%):':30} ${nonprod:12,.2f}/month")
    print("-"*80)
    
    grand_total = total_production + nonprod
    print(f"{'GRAND TOTAL:':30} ${grand_total:12,.2f}/month")
    print(f"{'':30} ${grand_total * 12:12,.2f}/year")
    print(f"{'Cost per Customer:':30} ${grand_total / metrics['customer_count']:12.2f}/month")
    print("="*80)
    
    # Comparison with original model
    print("\n" + "="*80)
    print("COMPARISON WITH ORIGINAL MODEL")
    print("="*80)
    original_cost = 71330  # From original model
    savings = original_cost - grand_total
    savings_pct = (savings / original_cost) * 100
    
    print(f"{'Original Model:':30} ${original_cost:12,.2f}/month")
    print(f"{'Realistic Model:':30} ${grand_total:12,.2f}/month")
    print(f"{'SAVINGS:':30} ${savings:12,.2f}/month ({savings_pct:.1f}%)")
    print("="*80)

def main():
    parser = argparse.ArgumentParser(description='Realistic Galaxy Platform Cost Model')
    parser.add_argument('config', help='Configuration file (YAML)')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Calculate metrics
    metrics = calculate_realistic_metrics(config)
    
    # Calculate costs
    all_costs = {
        'compute': calculate_compute_costs(metrics),
        'database': calculate_database_costs(metrics),
        'observability': calculate_observability_costs(metrics),
        'other': calculate_other_costs(metrics),
    }
    
    # Print report
    print_detailed_report(all_costs, metrics)

if __name__ == "__main__":
    main()