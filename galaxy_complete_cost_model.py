#!/usr/bin/env python3
"""
Complete Galaxy Platform Cost Estimation Model
Includes ALL 12 services with realistic data based on actual schemas
"""

import argparse
import sys
from typing import Dict, Any
from pricing_tables import PRICING, apply_architecture_multiplier
from utils import (
    load_config, format_cost, print_cost_report,
    compare_architectures, generate_cost_breakdown_chart
)

# COMPLETE Galaxy Platform Services (ALL 12 SERVICES)
GALAXY_SERVICES = {
    # Core Banking Services
    "proxima": {
        "name": "Core Banking Ledger",
        "type": "rust",
        "tier": "core",
        "instances": 3,  # Critical service - needs HA
        "cpu_per_instance": 4,
        "memory_per_instance": 8,
        "database": "postgres_large",  # Ledger needs performance
        "cache": True,
        "high_iops": True,
    },
    "titan": {
        "name": "Transaction Processing",
        "type": "rust",
        "tier": "core",
        "instances": 3,
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        "database": "postgres_medium",
        "queue": True,
        "high_iops": True,
    },
    
    # Customer Services
    "orion": {
        "name": "Retail Customer Service",
        "type": "rust",
        "tier": "customer_facing",
        "instances": 3,
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        "database": "postgres_medium",
        "cache": True,
        "api_gateway": True,
    },
    "quasar": {
        "name": "Customer Verification Service",
        "type": "rust",
        "tier": "security",
        "instances": 2,
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        "database": "postgres_small",
        "cache": True,
    },
    
    # Risk & Compliance
    "krypton": {
        "name": "Collateral Management",
        "type": "rust",
        "tier": "risk",
        "instances": 2,
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        "database": "postgres_medium",
        "storage_intensive": True,
    },
    "aster": {
        "name": "Approval Workflow Engine",
        "type": "rust",
        "tier": "workflow",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "queue": True,
    },
    
    # Configuration & Security
    "polaris": {
        "name": "Configuration Service",
        "type": "rust",
        "tier": "core",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "cache": True,
    },
    "draco": {
        "name": "RBAC Service",
        "type": "rust",
        "tier": "security",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "cache": True,
    },
    
    # Data & Analytics
    "nebula": {
        "name": "Contact Log Service",
        "type": "rust",
        "tier": "data",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_medium",
        "storage_intensive": True,
    },
    "aphelion": {
        "name": "Analytics Service",
        "type": "rust",
        "tier": "analytics",
        "instances": 2,
        "cpu_per_instance": 4,
        "memory_per_instance": 8,
        "database": "postgres_large",
        "data_warehouse": True,
    },
    
    # Integration & UI
    "pulsar": {
        "name": "Webhook Service",
        "type": "rust",
        "tier": "integration",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "queue": True,
        "api_gateway": True,
    },
    "horizon": {
        "name": "BackOffice Application",
        "type": "nodejs",
        "tier": "backoffice",
        "instances": 2,
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "api_gateway": True,
    },
}

def calculate_complete_galaxy_metrics(config: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate metrics for complete Galaxy platform with all 12 services"""
    customers = config['customer_count']
    
    # REALISTIC DATA SIZES based on actual schema analysis
    metrics = {
        'customer_count': customers,
        'architecture_variant': config['architecture_variant'],
        'services': list(GALAXY_SERVICES.keys()),
        'service_count': len(GALAXY_SERVICES),
        
        # Service-specific data volumes (per customer in KB, converted to GB)
        # Core Banking
        'proxima_ledger_gb': (customers * 250) / (1024 * 1024),  # 250KB per customer for ledger entries
        'titan_transaction_gb': (customers * 121.5) / (1024 * 1024),  # 121.5KB per customer
        
        # Customer Services  
        'orion_customer_gb': (customers * 9.5) / (1024 * 1024),  # 9.5KB per customer
        'quasar_verification_gb': (customers * 5) / (1024 * 1024),  # 5KB per customer for verification data
        
        # Risk & Compliance
        'krypton_collateral_gb': (customers * 0.3 * 50) / (1024 * 1024),  # 30% of customers have collateral, 50KB each
        'aster_approval_gb': (customers * 2) / (1024 * 1024),  # 2KB per customer for approval workflows
        
        # Configuration & Security (mostly fixed size)
        'polaris_config_gb': 0.05,  # 50 MB fixed
        'draco_rbac_gb': 0.1,  # 100 MB fixed
        
        # Data & Analytics
        'nebula_logs_gb': (customers * 12) / (1024 * 1024),  # 12KB per customer
        'aphelion_analytics_gb': (customers * 14.5) / (1024 * 1024),  # 14.5KB per customer
        
        # Integration & UI
        'pulsar_webhook_gb': (customers * 3) / (1024 * 1024),  # 3KB per customer for webhook configs
        'horizon_backoffice_gb': 0.05,  # 50 MB fixed for backoffice data
        
        # Transaction rates
        'ledger_tps': (customers / 1000) * 10,  # Proxima ledger entries
        'transaction_tps': (customers / 1000) * 5,  # Titan transactions
        'customer_api_tps': (customers / 1000) * 2,  # Orion API calls
        'webhook_tps': (customers / 1000) * 0.5,  # Pulsar webhooks
        
        # Settings
        'backup_retention_days': config.get('backup_retention_days', 30),
        'log_retention_days': config.get('log_retention_days', 90),
        'enable_multi_region': config.get('architecture_variant') == 'multi_region_3az',
    }
    
    # Calculate total data with 50% overhead for indexes, WAL, etc.
    raw_data_gb = sum([
        metrics['proxima_ledger_gb'],
        metrics['titan_transaction_gb'],
        metrics['orion_customer_gb'],
        metrics['quasar_verification_gb'],
        metrics['krypton_collateral_gb'],
        metrics['aster_approval_gb'],
        metrics['polaris_config_gb'],
        metrics['draco_rbac_gb'],
        metrics['nebula_logs_gb'],
        metrics['aphelion_analytics_gb'],
        metrics['pulsar_webhook_gb'],
        metrics['horizon_backoffice_gb'],
    ])
    metrics['total_data_gb'] = raw_data_gb * 1.5  # 50% overhead
    
    return metrics

def estimate_complete_compute_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate compute costs for all 12 Galaxy services"""
    total_cost = 0
    hours_per_month = 730
    
    for service_id, service in GALAXY_SERVICES.items():
        # Base compute cost
        vcpu_cost = (service['instances'] * service['cpu_per_instance'] * 
                    pricing['compute']['vcpu_hour'] * hours_per_month)
        memory_cost = (service['instances'] * service['memory_per_instance'] * 
                      pricing['compute']['memory_gb_hour'] * hours_per_month)
        
        # Scale customer-facing and core services based on customer count
        if service['tier'] in ['customer_facing', 'core']:
            scale_factor = 1 + (metrics['customer_count'] / 200000)  # Scale with customers
            vcpu_cost *= scale_factor
            memory_cost *= scale_factor
        
        total_cost += vcpu_cost + memory_cost
    
    # Add load balancers (2 per API gateway service)
    lb_count = sum(2 for s in GALAXY_SERVICES.values() if s.get('api_gateway'))
    total_cost += lb_count * pricing['compute']['load_balancer']
    
    # Container orchestration overhead (15% for Kubernetes)
    total_cost *= 1.15
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_complete_database_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate database costs for all 12 services"""
    total_cost = 0
    
    db_size_map = {
        'postgres_small': pricing['database']['postgres_instance']['small'],
        'postgres_medium': pricing['database']['postgres_instance']['medium'],
        'postgres_large': pricing['database']['postgres_instance']['large'],
        'postgres_xlarge': pricing['database']['postgres_instance']['xlarge'],
    }
    
    for service_id, service in GALAXY_SERVICES.items():
        if 'database' in service:
            # Primary database cost (3 instances for HA)
            base_cost = db_size_map[service['database']] * 3
            
            # Add read replicas for high-traffic services
            if service['tier'] in ['core', 'customer_facing', 'analytics']:
                replica_cost = base_cost * 0.7 * 2  # 2 read replicas
                total_cost += replica_cost
            
            total_cost += base_cost
    
    # Storage costs
    storage_cost = metrics['total_data_gb'] * pricing['database']['storage_gb']
    
    # IOPS for transaction-heavy services
    total_iops = (metrics['ledger_tps'] + metrics['transaction_tps']) * 20
    iops_cost = total_iops * pricing['database']['iops']
    
    # Backup costs
    backup_gb = metrics['total_data_gb'] * (1 + metrics['backup_retention_days'] / 7)
    backup_cost = backup_gb * pricing['database']['backup_gb']
    
    total_cost += storage_cost + iops_cost + backup_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_complete_observability_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate monitoring costs for 12 services"""
    # Count total instances
    total_instances = sum(s['instances'] for s in GALAXY_SERVICES.values())
    
    # Metrics (200 metrics per service instance)
    metrics_per_month = total_instances * 200 * 43200
    metrics_millions = metrics_per_month / 1000000
    metrics_cost = metrics_millions * pricing['observability']['metrics_million_datapoints']
    
    # Logs (more services = more logs)
    daily_logs_gb = (metrics['customer_count'] / 500) + (total_instances * 5)
    monthly_logs_gb = daily_logs_gb * 30
    log_ingestion_cost = monthly_logs_gb * pricing['observability']['logs_gb_ingested']
    log_storage_cost = monthly_logs_gb * metrics['log_retention_days'] / 30 * pricing['observability']['logs_gb_stored']
    
    # Distributed tracing (critical for 12 microservices)
    trace_millions = (metrics['customer_api_tps'] * 86400 * 30) / 1000000
    trace_cost = trace_millions * pricing['observability']['traces_million'] * 3  # 3x for complex microservices
    
    # APM for all instances
    apm_cost = total_instances * pricing['observability']['apm_host']
    
    total_cost = metrics_cost + log_ingestion_cost + log_storage_cost + trace_cost + apm_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def calculate_complete_galaxy_costs(metrics: Dict, pricing: Dict) -> Dict:
    """Calculate all costs for complete Galaxy platform"""
    variant = metrics['architecture_variant']
    
    # Main infrastructure components
    component_costs = {
        'compute': estimate_complete_compute_cost(metrics, pricing, variant),
        'database': estimate_complete_database_cost(metrics, pricing, variant),
        'observability': estimate_complete_observability_cost(metrics, pricing, variant),
    }
    
    # Additional components (simplified for brevity - reuse from original model)
    component_costs['cache_queue'] = len([s for s in GALAXY_SERVICES.values() if s.get('cache') or s.get('queue')]) * 100
    component_costs['api_gateway'] = (metrics['customer_api_tps'] * 86400 * 30 / 1000000) * pricing['api_gateway']['million_requests']
    component_costs['security'] = 30 * pricing['security']['kms_key'] + pricing['security']['ddos_protection']
    component_costs['storage'] = metrics['total_data_gb'] * pricing['storage']['object_standard_gb']
    component_costs['network'] = (metrics['customer_count'] / 1000) * 5  # Simplified
    component_costs['backup_dr'] = metrics['total_data_gb'] * 30 * pricing['backup_dr']['snapshot_gb']
    component_costs['cicd'] = 800 * pricing['cicd']['build_minutes'] + 300 * pricing['cicd']['artifact_storage_gb']
    
    total_monthly = sum(component_costs.values())
    
    # Add non-prod environments (40% of prod for 12 services)
    if metrics.get('include_nonprod', True):
        component_costs['non_production'] = total_monthly * 0.4
        total_monthly *= 1.4
    
    return {
        'components': component_costs,
        'total_monthly': total_monthly,
        'total_annual': total_monthly * 12,
        'cost_per_customer': total_monthly / metrics['customer_count'] if metrics['customer_count'] > 0 else 0,
        'cost_per_service': total_monthly / metrics['service_count'],
        'services': GALAXY_SERVICES,
    }

def print_complete_galaxy_report(costs: Dict, metrics: Dict):
    """Print complete Galaxy platform cost report"""
    print("\n" + "="*70)
    print("COMPLETE GALAXY PLATFORM COST ESTIMATION (ALL 12 SERVICES)")
    print("="*70)
    print(f"Architecture: {metrics['architecture_variant'].replace('_', ' ').title()}")
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Total Data Volume: {metrics['total_data_gb']:.1f} GB")
    print(f"Number of Services: {metrics['service_count']}")
    
    print("\n" + "-"*70)
    print("SERVICES BY CATEGORY:")
    print("-"*70)
    
    categories = {
        'Core Banking': ['proxima', 'titan'],
        'Customer Services': ['orion', 'quasar'],
        'Risk & Compliance': ['krypton', 'aster'],
        'Configuration & Security': ['polaris', 'draco'],
        'Data & Analytics': ['nebula', 'aphelion'],
        'Integration & UI': ['pulsar', 'horizon'],
    }
    
    for category, services in categories.items():
        print(f"\n{category}:")
        for service_id in services:
            service = GALAXY_SERVICES[service_id]
            print(f"  • {service_id:10} - {service['name']} ({service['type']})")
    
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
    print(f"{'Cost per Customer/Month':.<30} {format_cost(costs['cost_per_customer']):>15}")
    print(f"{'Cost per Service/Month':.<30} {format_cost(costs['cost_per_service']):>15}")
    print("="*70)

def main():
    """Main function for complete Galaxy cost estimation"""
    parser = argparse.ArgumentParser(description='Complete Galaxy Platform Cost Model (12 Services)')
    parser.add_argument('config', help='Path to configuration file')
    parser.add_argument('--compare', action='store_true', help='Compare architecture variants')
    parser.add_argument('--no-nonprod', action='store_true', help='Exclude non-production costs')
    
    args = parser.parse_args()
    
    try:
        # Load config
        config = load_config(args.config)
        
        # Calculate metrics
        metrics = calculate_complete_galaxy_metrics(config)
        metrics['include_nonprod'] = not args.no_nonprod
        
        # Calculate costs
        costs = calculate_complete_galaxy_costs(metrics, PRICING)
        
        # Print report
        print_complete_galaxy_report(costs, metrics)
        
        # Compare architectures if requested
        if args.compare:
            # Single region
            single_config = config.copy()
            single_config['architecture_variant'] = 'single_region_3az'
            single_metrics = calculate_complete_galaxy_metrics(single_config)
            single_metrics['include_nonprod'] = not args.no_nonprod
            single_costs = calculate_complete_galaxy_costs(single_metrics, PRICING)
            
            # Multi-region
            multi_config = config.copy()
            multi_config['architecture_variant'] = 'multi_region_3az'
            multi_metrics = calculate_complete_galaxy_metrics(multi_config)
            multi_metrics['include_nonprod'] = not args.no_nonprod
            multi_costs = calculate_complete_galaxy_costs(multi_metrics, PRICING)
            
            compare_architectures(single_costs, multi_costs)
        
        print("\n✓ Complete Galaxy platform cost estimation finished (12 services)")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())