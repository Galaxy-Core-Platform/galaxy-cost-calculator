#!/usr/bin/env python3
"""
Core Banking Infrastructure Cost Estimation Model
Estimates infrastructure costs based on customer count and architecture choices
"""

import argparse
import sys
from typing import Dict, Any
from pricing_tables import PRICING, get_instance_size, get_compute_instances, apply_architecture_multiplier
from utils import (
    load_config, calculate_derived_metrics, format_cost,
    print_cost_report, compare_architectures,
    generate_cost_breakdown_chart, generate_scaling_chart
)

def estimate_database_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate database costs including primary, replicas, and backups"""
    customers = metrics['customer_count']
    total_data_gb = metrics['total_data_gb']
    
    # Determine instance size
    instance_size = get_instance_size(customers)
    base_cost = pricing['database']['postgres_instance'][instance_size]
    
    # Primary database (assuming 3 instances for HA in 3 AZs)
    primary_cost = base_cost * 3
    
    # Read replicas (2 additional for read scaling)
    replica_cost = base_cost * 2 * pricing['database']['replica_multiplier']
    
    # Storage costs
    storage_cost = total_data_gb * pricing['database']['storage_gb']
    
    # IOPS (provisioned based on TPS)
    iops_needed = metrics['peak_tps'] * 10  # 10 IOPS per TPS
    iops_cost = iops_needed * pricing['database']['iops']
    
    # Backup storage (full + incremental for retention period)
    backup_size_gb = total_data_gb * (1 + metrics['backup_retention_days'] / 7)
    backup_cost = backup_size_gb * pricing['database']['backup_gb']
    
    total = primary_cost + replica_cost + storage_cost + iops_cost + backup_cost
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_compute_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate compute costs for application servers"""
    peak_tps = metrics['peak_tps']
    
    # Calculate required instances
    instances = get_compute_instances(peak_tps)
    
    # Assume 4 vCPU, 16GB RAM per instance
    vcpu_per_instance = 4
    memory_per_instance = 16
    
    # Calculate hourly costs (730 hours per month)
    hours_per_month = 730
    vcpu_cost = instances * vcpu_per_instance * pricing['compute']['vcpu_hour'] * hours_per_month
    memory_cost = instances * memory_per_instance * pricing['compute']['memory_gb_hour'] * hours_per_month
    
    # Load balancers (2 for HA)
    lb_cost = 2 * pricing['compute']['load_balancer']
    
    # Container orchestration overhead (20% additional)
    container_overhead = (vcpu_cost + memory_cost) * 0.2
    
    total = vcpu_cost + memory_cost + lb_cost + container_overhead
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_storage_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate storage costs for various storage types"""
    # Block storage for databases (already counted in database costs)
    
    # Object storage for documents and archives
    document_storage = metrics['document_data_gb'] * pricing['storage']['object_standard_gb']
    
    # Archive storage for compliance (assume 2 years of transaction history)
    archive_storage = metrics['transaction_data_gb'] * 2 * pricing['storage']['object_archive_gb']
    
    # File storage for shared data
    file_storage = metrics['customer_count'] / 1000 * 10 * pricing['storage']['file_storage_gb']  # 10GB per 1000 customers
    
    total = document_storage + archive_storage + file_storage
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_network_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate network costs including data transfer and connections"""
    monthly_api_calls = metrics['monthly_api_calls']
    
    # Estimate data transfer (assume 1KB per API call average)
    monthly_transfer_gb = (monthly_api_calls * 1) / (1024 * 1024)  # Convert KB to GB
    egress_cost = monthly_transfer_gb * pricing['network']['data_transfer_gb']
    
    # Inter-AZ transfer (30% of total traffic)
    inter_az_gb = monthly_transfer_gb * 0.3
    inter_az_cost = inter_az_gb * pricing['network']['inter_az_gb']
    
    # VPN connections (assume 2)
    vpn_cost = 2 * pricing['network']['vpn_connection']
    
    # CDN for static assets
    cdn_gb = metrics['customer_count'] / 1000 * 5  # 5GB per 1000 customers
    cdn_cost = cdn_gb * pricing['network']['cdn_gb']
    
    total = egress_cost + inter_az_cost + vpn_cost + cdn_cost
    
    # For multi-region, add inter-region transfer costs
    if "multi_region" in variant:
        inter_region_gb = monthly_transfer_gb * 0.2  # 20% crosses regions
        inter_region_cost = inter_region_gb * pricing['network']['inter_region_gb']
        total += inter_region_cost
    
    return total

def estimate_cache_queue_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate costs for caching and message queuing"""
    customers = metrics['customer_count']
    
    # Redis cache (1GB per 10,000 customers)
    redis_gb = max(2, customers / 10000)  # Minimum 2GB
    redis_cost = redis_gb * pricing['cache_queue']['redis_gb']
    
    # Kafka brokers (based on TPS)
    kafka_brokers = max(3, int(metrics['peak_tps'] / 500) + 1)  # 500 TPS per broker
    kafka_cost = kafka_brokers * pricing['cache_queue']['kafka_broker']
    
    # SQS for async processing (est. 10M messages per 10k customers)
    sqs_millions = (customers / 10000) * 10
    sqs_cost = sqs_millions * pricing['cache_queue']['sqs_million_requests']
    
    total = redis_cost + kafka_cost + sqs_cost
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_api_gateway_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate API gateway and service mesh costs"""
    monthly_api_calls = metrics['monthly_api_calls']
    
    # API gateway requests
    api_millions = monthly_api_calls / 1000000
    request_cost = api_millions * pricing['api_gateway']['million_requests']
    
    # Data transfer (assume 2KB per request)
    transfer_gb = (monthly_api_calls * 2) / (1024 * 1024)
    transfer_cost = transfer_gb * pricing['api_gateway']['data_transfer_gb']
    
    # WebSocket connections (10% of customers maintain connections)
    websocket_minutes = metrics['customer_count'] * 0.1 * 43200  # 30 days * 24 hours * 60 min * 10%
    websocket_millions = websocket_minutes / 1000000
    websocket_cost = websocket_millions * pricing['api_gateway']['websocket_million_minutes']
    
    total = request_cost + transfer_cost + websocket_cost
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_security_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate security infrastructure costs"""
    customers = metrics['customer_count']
    monthly_api_calls = metrics['monthly_api_calls']
    
    # KMS keys (10 keys base + 1 per 10k customers)
    num_keys = 10 + (customers // 10000)
    kms_key_cost = num_keys * pricing['security']['kms_key']
    
    # KMS requests (encryption/decryption)
    kms_requests_10k = monthly_api_calls / 10000 * 0.1  # 10% of API calls need encryption
    kms_request_cost = kms_requests_10k * pricing['security']['kms_requests_10k']
    
    # HSM for critical operations (1 for <100k customers, 2 for more)
    hsm_instances = 1 if customers < 100000 else 2
    hsm_cost = hsm_instances * pricing['security']['hsm_instance']
    
    # WAF
    waf_millions = monthly_api_calls / 1000000
    waf_cost = waf_millions * pricing['security']['waf_million_requests']
    
    # DDoS protection (flat fee)
    ddos_cost = pricing['security']['ddos_protection']
    
    total = kms_key_cost + kms_request_cost + hsm_cost + waf_cost + ddos_cost
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_observability_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate observability and monitoring costs"""
    customers = metrics['customer_count']
    instances = get_compute_instances(metrics['peak_tps'])
    
    # Metrics (100 metrics per instance, 1-minute resolution)
    metrics_per_month = instances * 100 * 43200  # 30 days * 24 hours * 60 min
    metrics_millions = metrics_per_month / 1000000
    metrics_cost = metrics_millions * pricing['observability']['metrics_million_datapoints']
    
    # Logs (1GB per 1000 customers per day)
    daily_logs_gb = customers / 1000
    monthly_logs_gb = daily_logs_gb * 30
    log_ingestion_cost = monthly_logs_gb * pricing['observability']['logs_gb_ingested']
    log_storage_cost = monthly_logs_gb * metrics['log_retention_days'] / 30 * pricing['observability']['logs_gb_stored']
    
    # Traces (1 trace per 100 transactions)
    monthly_transactions = metrics['daily_transactions'] * 30
    traces_millions = (monthly_transactions / 100) / 1000000
    trace_cost = traces_millions * pricing['observability']['traces_million']
    
    # APM
    apm_cost = instances * pricing['observability']['apm_host']
    
    total = metrics_cost + log_ingestion_cost + log_storage_cost + trace_cost + apm_cost
    
    # Apply architecture multiplier
    return apply_architecture_multiplier(total, variant)

def estimate_backup_dr_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate backup and disaster recovery costs"""
    total_data_gb = metrics['total_data_gb']
    
    # Daily snapshots with retention
    snapshot_storage_gb = total_data_gb * metrics['backup_retention_days']
    snapshot_cost = snapshot_storage_gb * pricing['backup_dr']['snapshot_gb']
    
    # Point-in-time recovery overhead
    pitr_multiplier = pricing['backup_dr']['pitr_enabled_multiplier']
    pitr_cost = snapshot_cost * (pitr_multiplier - 1)
    
    # Cross-region replication for DR (only for critical data)
    if "multi_region" in variant:
        critical_data_gb = total_data_gb * 0.3  # 30% is critical
        replication_cost = critical_data_gb * 30 * pricing['backup_dr']['cross_region_replication_gb']
    else:
        replication_cost = 0
    
    total = snapshot_cost + pitr_cost + replication_cost
    
    return total

def estimate_cicd_cost(metrics: Dict, pricing: Dict, variant: str) -> float:
    """Estimate CI/CD infrastructure costs"""
    # Assume team size based on customer count
    team_size = 5 + (metrics['customer_count'] // 50000) * 2
    
    # Build minutes (100 builds per day, 10 minutes each)
    daily_build_minutes = 100 * 10
    monthly_build_minutes = daily_build_minutes * 30
    build_cost = monthly_build_minutes * pricing['cicd']['build_minutes']
    
    # Artifact storage (100GB base + 10GB per 10k customers)
    artifact_gb = 100 + (metrics['customer_count'] / 10000) * 10
    artifact_cost = artifact_gb * pricing['cicd']['artifact_storage_gb']
    
    # Container registry
    registry_gb = artifact_gb * 0.5  # 50% of artifacts are containers
    registry_cost = registry_gb * pricing['cicd']['container_registry_gb']
    
    # Pipeline users
    user_cost = team_size * pricing['cicd']['pipeline_user']
    
    total = build_cost + artifact_cost + registry_cost + user_cost
    
    # CI/CD doesn't scale with architecture variant
    return total

def estimate_nonprod_cost(prod_costs: Dict, config: Dict) -> float:
    """Estimate non-production environment costs"""
    metrics = calculate_derived_metrics(config)
    
    # Calculate costs for each environment
    dev_cost = prod_costs['total_monthly'] * metrics['dev_env_scale']
    staging_cost = prod_costs['total_monthly'] * metrics['staging_env_scale']
    uat_cost = prod_costs['total_monthly'] * metrics['uat_env_scale']
    
    return dev_cost + staging_cost + uat_cost

def aggregate_costs(component_costs: Dict[str, float]) -> Dict[str, Any]:
    """Aggregate all component costs and calculate totals"""
    total_monthly = sum(component_costs.values())
    total_annual = total_monthly * 12
    
    return {
        'components': component_costs,
        'total_monthly': total_monthly,
        'total_annual': total_annual,
    }

def perform_sensitivity_analysis(base_config: Dict, pricing: Dict) -> list:
    """Perform sensitivity analysis with different customer counts"""
    base_customers = base_config['customer_count']
    scenarios = [
        ('50% reduction', base_customers * 0.5),
        ('Baseline', base_customers),
        ('2x growth', base_customers * 2),
        ('5x growth', base_customers * 5),
    ]
    
    results = []
    for scenario_name, customer_count in scenarios:
        # Update config
        test_config = base_config.copy()
        test_config['customer_count'] = int(customer_count)
        
        # Calculate costs
        metrics = calculate_derived_metrics(test_config)
        costs = calculate_all_costs(metrics, pricing)
        
        results.append({
            'scenario': scenario_name,
            'customer_count': int(customer_count),
            'total_monthly_cost': costs['total_monthly'],
            'cost_per_customer': costs['total_monthly'] / customer_count if customer_count > 0 else 0,
        })
    
    return results

def calculate_all_costs(metrics: Dict, pricing: Dict) -> Dict:
    """Calculate all infrastructure costs"""
    variant = metrics['architecture_variant']
    
    component_costs = {
        'database': estimate_database_cost(metrics, pricing, variant),
        'compute': estimate_compute_cost(metrics, pricing, variant),
        'storage': estimate_storage_cost(metrics, pricing, variant),
        'network': estimate_network_cost(metrics, pricing, variant),
        'cache_queue': estimate_cache_queue_cost(metrics, pricing, variant),
        'api_gateway': estimate_api_gateway_cost(metrics, pricing, variant),
        'security': estimate_security_cost(metrics, pricing, variant),
        'observability': estimate_observability_cost(metrics, pricing, variant),
        'backup_dr': estimate_backup_dr_cost(metrics, pricing, variant),
        'cicd': estimate_cicd_cost(metrics, pricing, variant),
    }
    
    # Aggregate costs
    costs = aggregate_costs(component_costs)
    
    # Add per-unit costs
    costs['cost_per_customer'] = costs['total_monthly'] / metrics['customer_count'] if metrics['customer_count'] > 0 else 0
    costs['cost_per_transaction'] = costs['total_monthly'] / (metrics['daily_transactions'] * 30) if metrics['daily_transactions'] > 0 else 0
    
    return costs

def main():
    """Main function to run the cost estimation model"""
    parser = argparse.ArgumentParser(description='Core Banking Infrastructure Cost Estimation Model')
    parser.add_argument('config', help='Path to configuration file (YAML or JSON)')
    parser.add_argument('--compare', action='store_true', help='Compare both architecture variants')
    parser.add_argument('--sensitivity', action='store_true', help='Run sensitivity analysis')
    parser.add_argument('--charts', action='store_true', help='Generate visualization charts')
    parser.add_argument('--include-nonprod', action='store_true', help='Include non-production environment costs')
    
    args = parser.parse_args()
    
    try:
        # Load configuration
        config = load_config(args.config)
        
        # Calculate metrics
        metrics = calculate_derived_metrics(config)
        
        # Calculate costs for configured architecture
        costs = calculate_all_costs(metrics, PRICING)
        
        # Add non-prod costs if requested
        if args.include_nonprod:
            nonprod_cost = estimate_nonprod_cost(costs, config)
            costs['components']['non_production'] = nonprod_cost
            costs['total_monthly'] += nonprod_cost
            costs['total_annual'] = costs['total_monthly'] * 12
        
        # Print main report
        print_cost_report(costs, metrics)
        
        # Compare architectures if requested
        if args.compare:
            # Calculate for single region
            single_config = config.copy()
            single_config['architecture_variant'] = 'single_region_3az'
            single_metrics = calculate_derived_metrics(single_config)
            single_costs = calculate_all_costs(single_metrics, PRICING)
            
            # Calculate for multi-region
            multi_config = config.copy()
            multi_config['architecture_variant'] = 'multi_region_3az'
            multi_metrics = calculate_derived_metrics(multi_config)
            multi_costs = calculate_all_costs(multi_metrics, PRICING)
            
            # Compare
            compare_architectures(single_costs, multi_costs)
        
        # Run sensitivity analysis if requested
        if args.sensitivity:
            print("\n" + "="*60)
            print("SENSITIVITY ANALYSIS")
            print("="*60)
            
            sensitivity_results = perform_sensitivity_analysis(config, PRICING)
            
            print(f"{'Scenario':.<25} {'Customers':>12} {'Monthly Cost':>15} {'Cost/Customer':>12}")
            print("-"*60)
            for result in sensitivity_results:
                print(f"{result['scenario']:.<25} {result['customer_count']:>12,} "
                      f"{format_cost(result['total_monthly_cost']):>15} "
                      f"{format_cost(result['cost_per_customer']):>12}")
            
            if args.charts:
                generate_scaling_chart(sensitivity_results, 'cost_scaling.png')
        
        # Generate charts if requested
        if args.charts:
            generate_cost_breakdown_chart(costs['components'], 'cost_breakdown.png')
        
        print("\n✓ Cost estimation completed successfully")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())