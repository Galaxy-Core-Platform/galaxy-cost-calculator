#!/usr/bin/env python3
"""
Galaxy Platform-Specific Cost Estimation Model
Estimates infrastructure costs based on actual Galaxy services architecture
"""

import argparse
import sys
from typing import Dict, Any, List
from pricing_tables import PRICING, apply_architecture_multiplier
from utils import (
    load_config, format_cost, print_cost_report,
    compare_architectures, generate_cost_breakdown_chart
)

# Galaxy Platform Services Mapping
GALAXY_SERVICES = {
    "polaris": {
        "name": "Configuration Service",
        "type": "rust",
        "tier": "core",
        "instances": 2,  # HA setup
        "cpu_per_instance": 1,
        "memory_per_instance": 2,
        "database": "postgres_small",
        "cache": True,
    },
    "orion": {
        "name": "Retail Customer Service",
        "type": "rust",
        "tier": "customer_facing",
        "instances": 3,  # Scales with load balancer
        "cpu_per_instance": 2,
        "memory_per_instance": 4,
        "database": "postgres_medium",
        "cache": True,
        "api_gateway": True,
    },
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
}

def calculate_galaxy_metrics(config: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate metrics specific to Galaxy platform"""
    customers = config['customer_count']
    
    # REALISTIC DATA SIZES based on actual schema analysis
    # Per customer: ~158 KB total across all services
    metrics = {
        'customer_count': customers,
        'architecture_variant': config['architecture_variant'],
        'services': list(GALAXY_SERVICES.keys()),
        
        # Service-specific data volumes (REALISTIC)
        'config_data_gb': 0.05,  # Polaris config data (50 MB fixed)
        'customer_data_gb': (customers * 9.5) / (1024 * 1024),  # Orion: 9.5KB per customer
        'contact_logs_gb': (customers * 12) / (1024 * 1024),  # Nebula: 12KB per customer  
        'transaction_data_gb': (customers * 121.5) / (1024 * 1024),  # Titan: 121.5KB per customer
        'analytics_data_gb': (customers * 14.5) / (1024 * 1024),  # Aphelion: 14.5KB per customer
        'backoffice_data_gb': 0.05,  # Horizon backoffice data (50 MB fixed)
        'rbac_data_gb': 0.1,  # Draco RBAC data (100 MB fixed)
        
        # Transaction rates by service
        'customer_api_tps': (customers / 1000) * 2,  # Orion API calls
        'transaction_tps': (customers / 1000) * 5,  # Titan processing
        'analytics_batch_gb': customers / 100,  # Daily analytics processing
        
        # Galaxy-specific settings
        'backup_retention_days': config.get('backup_retention_days', 30),
        'log_retention_days': config.get('log_retention_days', 90),
        'enable_multi_region': config.get('architecture_variant') == 'multi_region_3az',
    }
    
    # Calculate total data (with 50% overhead for indexes, WAL, etc.)
    raw_data_gb = sum([
        metrics['config_data_gb'],
        metrics['customer_data_gb'],
        metrics['contact_logs_gb'],
        metrics['transaction_data_gb'],
        metrics['analytics_data_gb'],
        metrics['backoffice_data_gb'],
        metrics['rbac_data_gb'],
    ])
    metrics['total_data_gb'] = raw_data_gb * 1.5  # 50% overhead for indexes, WAL, etc.
    
    return metrics

def estimate_galaxy_compute_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate compute costs for all Galaxy services"""
    total_cost = 0
    hours_per_month = 730
    
    for service_id, service in GALAXY_SERVICES.items():
        # Base compute cost
        vcpu_cost = (service['instances'] * service['cpu_per_instance'] * 
                    pricing['compute']['vcpu_hour'] * hours_per_month)
        memory_cost = (service['instances'] * service['memory_per_instance'] * 
                      pricing['compute']['memory_gb_hour'] * hours_per_month)
        
        # Scale customer-facing services based on customer count
        if service['tier'] == 'customer_facing':
            scale_factor = 1 + (metrics['customer_count'] / 100000)  # Scale with customers
            vcpu_cost *= scale_factor
            memory_cost *= scale_factor
        
        total_cost += vcpu_cost + memory_cost
    
    # Add load balancers (2 per customer-facing service)
    lb_count = sum(2 for s in GALAXY_SERVICES.values() if s.get('api_gateway'))
    total_cost += lb_count * pricing['compute']['load_balancer']
    
    # Container orchestration overhead
    total_cost *= 1.15  # 15% overhead for Kubernetes/orchestration
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_database_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate database costs for all Galaxy services"""
    total_cost = 0
    
    # Map database sizes to pricing
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
            if service['tier'] in ['customer_facing', 'analytics']:
                replica_cost = base_cost * 0.7 * 2  # 2 read replicas
                total_cost += replica_cost
            
            total_cost += base_cost
    
    # Storage costs
    storage_cost = metrics['total_data_gb'] * pricing['database']['storage_gb']
    
    # IOPS for transaction-heavy services
    transaction_iops = metrics['transaction_tps'] * 20
    iops_cost = transaction_iops * pricing['database']['iops']
    
    # Backup costs
    backup_gb = metrics['total_data_gb'] * (1 + metrics['backup_retention_days'] / 7)
    backup_cost = backup_gb * pricing['database']['backup_gb']
    
    total_cost += storage_cost + iops_cost + backup_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_cache_queue_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate caching and queue costs for Galaxy services"""
    total_cost = 0
    
    # Redis for services with caching
    cache_services = [s for s in GALAXY_SERVICES.values() if s.get('cache')]
    redis_gb_per_service = max(2, metrics['customer_count'] / 50000)  # Scale with customers
    redis_cost = len(cache_services) * redis_gb_per_service * pricing['cache_queue']['redis_gb']
    
    # Kafka for Titan transaction processing
    kafka_brokers = max(3, int(metrics['transaction_tps'] / 500) + 1)
    kafka_cost = kafka_brokers * pricing['cache_queue']['kafka_broker']
    
    # SQS for async processing
    sqs_millions = (metrics['customer_count'] / 10000) * 15  # More messages for Galaxy
    sqs_cost = sqs_millions * pricing['cache_queue']['sqs_million_requests']
    
    total_cost = redis_cost + kafka_cost + sqs_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_api_gateway_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate API gateway costs for Galaxy services"""
    # Services with API gateway: Orion, Horizon
    monthly_api_calls = metrics['customer_api_tps'] * 86400 * 30  # TPS to monthly
    
    # Add internal service-to-service calls
    internal_multiplier = 2.5  # Each external call triggers ~2.5 internal calls
    total_calls = monthly_api_calls * internal_multiplier
    
    api_millions = total_calls / 1000000
    request_cost = api_millions * pricing['api_gateway']['million_requests']
    
    # Data transfer
    transfer_gb = (total_calls * 3) / (1024 * 1024)  # 3KB average per call
    transfer_cost = transfer_gb * pricing['api_gateway']['data_transfer_gb']
    
    total_cost = request_cost + transfer_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_observability_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate monitoring costs for Galaxy platform"""
    # Count total instances
    total_instances = sum(s['instances'] for s in GALAXY_SERVICES.values())
    
    # Metrics (200 metrics per service instance)
    metrics_per_month = total_instances * 200 * 43200
    metrics_millions = metrics_per_month / 1000000
    metrics_cost = metrics_millions * pricing['observability']['metrics_million_datapoints']
    
    # Logs (higher volume for Galaxy microservices)
    daily_logs_gb = (metrics['customer_count'] / 500) + (total_instances * 5)  # 5GB per instance
    monthly_logs_gb = daily_logs_gb * 30
    log_ingestion_cost = monthly_logs_gb * pricing['observability']['logs_gb_ingested']
    log_storage_cost = monthly_logs_gb * metrics['log_retention_days'] / 30 * pricing['observability']['logs_gb_stored']
    
    # Distributed tracing (critical for microservices)
    trace_millions = (metrics['customer_api_tps'] * 86400 * 30) / 1000000
    trace_cost = trace_millions * pricing['observability']['traces_million'] * 2  # 2x for microservices
    
    # APM for all instances
    apm_cost = total_instances * pricing['observability']['apm_host']
    
    total_cost = metrics_cost + log_ingestion_cost + log_storage_cost + trace_cost + apm_cost
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_security_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate security costs including Draco RBAC service"""
    customers = metrics['customer_count']
    
    # KMS keys (more keys for microservices)
    num_keys = 20 + len(GALAXY_SERVICES) * 2  # 2 keys per service + base keys
    kms_key_cost = num_keys * pricing['security']['kms_key']
    
    # KMS requests (higher for microservices authentication)
    kms_requests_10k = (metrics['customer_api_tps'] * 86400 * 30) / 10000 * 0.3
    kms_request_cost = kms_requests_10k * pricing['security']['kms_requests_10k']
    
    # HSM for critical operations
    hsm_instances = 2 if customers < 100000 else 3
    hsm_cost = hsm_instances * pricing['security']['hsm_instance']
    
    # WAF for external-facing services
    waf_millions = (metrics['customer_api_tps'] * 86400 * 30) / 1000000
    waf_cost = waf_millions * pricing['security']['waf_million_requests']
    
    # DDoS protection
    ddos_cost = pricing['security']['ddos_protection']
    
    # Additional cost for Draco RBAC service overhead
    rbac_overhead = (customers / 10000) * 50  # $50 per 10k customers for RBAC processing
    
    total_cost = kms_key_cost + kms_request_cost + hsm_cost + waf_cost + ddos_cost + rbac_overhead
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_storage_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate storage costs for Galaxy platform"""
    # Object storage for Nebula contact logs
    contact_storage = metrics['contact_logs_gb'] * pricing['storage']['object_standard_gb']
    
    # Archive storage for compliance
    archive_storage = metrics['transaction_data_gb'] * 2 * pricing['storage']['object_archive_gb']
    
    # File storage for shared data between services
    file_storage = len(GALAXY_SERVICES) * 100 * pricing['storage']['file_storage_gb']
    
    # Analytics data warehouse storage (Aphelion)
    warehouse_storage = metrics['analytics_data_gb'] * pricing['storage']['block_ssd_gb']
    
    total_cost = contact_storage + archive_storage + file_storage + warehouse_storage
    
    return apply_architecture_multiplier(total_cost, variant)

def estimate_galaxy_network_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate network costs for Galaxy microservices"""
    # Service-to-service communication
    internal_traffic_gb = metrics['customer_api_tps'] * 86400 * 30 * 5 / (1024 * 1024)  # 5KB per call
    
    # External API traffic
    external_traffic_gb = metrics['customer_api_tps'] * 86400 * 30 * 2 / (1024 * 1024)  # 2KB per call
    
    # Inter-AZ traffic (microservices communicate across AZs)
    inter_az_cost = internal_traffic_gb * 0.5 * pricing['network']['inter_az_gb']
    
    # Internet egress
    egress_cost = external_traffic_gb * pricing['network']['data_transfer_gb']
    
    # VPN for secure connections
    vpn_cost = 3 * pricing['network']['vpn_connection']  # Multiple VPNs
    
    # Service mesh overhead (Istio/Linkerd)
    service_mesh_cost = len(GALAXY_SERVICES) * 20  # $20 per service for mesh overhead
    
    total_cost = inter_az_cost + egress_cost + vpn_cost + service_mesh_cost
    
    # Multi-region replication
    if metrics['enable_multi_region']:
        replication_gb = metrics['total_data_gb'] * 0.3  # 30% of data replicated
        inter_region_cost = replication_gb * pricing['network']['inter_region_gb']
        total_cost += inter_region_cost
    
    return total_cost

def calculate_galaxy_costs(metrics: Dict, pricing: Dict) -> Dict:
    """Calculate all costs for Galaxy platform"""
    variant = metrics['architecture_variant']
    
    component_costs = {
        'compute': estimate_galaxy_compute_cost(metrics, pricing, variant),
        'database': estimate_galaxy_database_cost(metrics, pricing, variant),
        'cache_queue': estimate_galaxy_cache_queue_cost(metrics, pricing, variant),
        'api_gateway': estimate_galaxy_api_gateway_cost(metrics, pricing, variant),
        'observability': estimate_galaxy_observability_cost(metrics, pricing, variant),
        'security': estimate_galaxy_security_cost(metrics, pricing, variant),
        'storage': estimate_galaxy_storage_cost(metrics, pricing, variant),
        'network': estimate_galaxy_network_cost(metrics, pricing, variant),
    }
    
    # Add standard components
    component_costs['backup_dr'] = metrics['total_data_gb'] * 30 * pricing['backup_dr']['snapshot_gb']
    component_costs['cicd'] = 500 * pricing['cicd']['build_minutes'] + 200 * pricing['cicd']['artifact_storage_gb']
    
    total_monthly = sum(component_costs.values())
    
    # Add non-prod environments (30% of prod for Galaxy - one shared dev/test environment)
    if metrics.get('include_nonprod', True):
        component_costs['non_production'] = total_monthly * 0.3
        total_monthly *= 1.3
    
    return {
        'components': component_costs,
        'total_monthly': total_monthly,
        'total_annual': total_monthly * 12,
        'cost_per_customer': total_monthly / metrics['customer_count'] if metrics['customer_count'] > 0 else 0,
        'services': GALAXY_SERVICES,
    }

def print_galaxy_report(costs: Dict, metrics: Dict):
    """Print Galaxy-specific cost report"""
    print("\n" + "="*60)
    print("GALAXY PLATFORM COST ESTIMATION REPORT")
    print("="*60)
    print(f"Architecture: {metrics['architecture_variant'].replace('_', ' ').title()}")
    print(f"Customer Count: {metrics['customer_count']:,}")
    print(f"Total Data Volume: {metrics['total_data_gb']:.1f} GB")
    print(f"\nActive Services ({len(GALAXY_SERVICES)}):")
    for service_id, service in GALAXY_SERVICES.items():
        print(f"  • {service_id}: {service['name']} ({service['type']})")
    
    print("\n" + "-"*60)
    print("COMPONENT COST BREAKDOWN (Monthly)")
    print("-"*60)
    
    for component, cost in sorted(costs['components'].items(), key=lambda x: x[1], reverse=True):
        if cost > 0:
            percentage = (cost / costs['total_monthly'] * 100)
            print(f"{component.replace('_', ' ').title():.<30} {format_cost(cost):>12} ({percentage:5.1f}%)")
    
    print("-"*60)
    print(f"{'TOTAL MONTHLY COST':.<30} {format_cost(costs['total_monthly']):>12}")
    print(f"{'TOTAL ANNUAL COST':.<30} {format_cost(costs['total_annual']):>12}")
    print(f"{'Cost per Customer/Month':.<30} {format_cost(costs['cost_per_customer']):>12}")
    print("="*60)

def main():
    """Main function for Galaxy cost estimation"""
    parser = argparse.ArgumentParser(description='Galaxy Platform Cost Estimation Model')
    parser.add_argument('config', help='Path to configuration file')
    parser.add_argument('--compare', action='store_true', help='Compare architecture variants')
    parser.add_argument('--no-nonprod', action='store_true', help='Exclude non-production costs')
    
    args = parser.parse_args()
    
    try:
        # Load config
        config = load_config(args.config)
        
        # Calculate Galaxy metrics
        metrics = calculate_galaxy_metrics(config)
        metrics['include_nonprod'] = not args.no_nonprod
        
        # Calculate costs
        costs = calculate_galaxy_costs(metrics, PRICING)
        
        # Print report
        print_galaxy_report(costs, metrics)
        
        # Compare architectures if requested
        if args.compare:
            # Single region
            single_config = config.copy()
            single_config['architecture_variant'] = 'single_region_3az'
            single_metrics = calculate_galaxy_metrics(single_config)
            single_metrics['include_nonprod'] = not args.no_nonprod
            single_costs = calculate_galaxy_costs(single_metrics, PRICING)
            
            # Multi-region
            multi_config = config.copy()
            multi_config['architecture_variant'] = 'multi_region_3az'
            multi_metrics = calculate_galaxy_metrics(multi_config)
            multi_metrics['include_nonprod'] = not args.no_nonprod
            multi_costs = calculate_galaxy_costs(multi_metrics, PRICING)
            
            compare_architectures(single_costs, multi_costs)
        
        print("\n✓ Galaxy platform cost estimation completed")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())