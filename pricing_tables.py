"""
Vendor pricing tables for infrastructure components
All prices are in USD per month unless specified otherwise
"""

PRICING = {
    "compute": {
        "vcpu_hour": 0.04,  # per vCPU-hour
        "memory_gb_hour": 0.005,  # per GB-hour
        "load_balancer": 25,  # per LB per month
        "container_instance": 0.02,  # per container-hour
    },
    
    "database": {
        "postgres_instance": {
            "small": 200,  # 2 vCPU, 8GB RAM
            "medium": 400,  # 4 vCPU, 16GB RAM
            "large": 800,  # 8 vCPU, 32GB RAM
            "xlarge": 1600,  # 16 vCPU, 64GB RAM
        },
        "storage_gb": 0.115,  # per GB-month
        "iops": 0.10,  # per provisioned IOPS
        "backup_gb": 0.095,  # per GB-month
        "replica_multiplier": 0.7,  # read replica cost as % of primary
    },
    
    "storage": {
        "block_ssd_gb": 0.10,  # per GB-month
        "block_hdd_gb": 0.045,  # per GB-month
        "object_standard_gb": 0.023,  # per GB-month
        "object_archive_gb": 0.004,  # per GB-month
        "file_storage_gb": 0.30,  # per GB-month for NFS/shared
    },
    
    "network": {
        "data_transfer_gb": 0.09,  # egress to internet
        "inter_region_gb": 0.02,  # between regions
        "inter_az_gb": 0.01,  # between availability zones
        "vpn_connection": 50,  # per connection per month
        "direct_connect_port": 500,  # per port per month
        "cdn_gb": 0.085,  # CDN data transfer
    },
    
    "cache_queue": {
        "redis_gb": 15,  # per GB memory per month
        "kafka_broker": 150,  # per broker per month
        "sqs_million_requests": 0.40,  # per million requests
    },
    
    "api_gateway": {
        "million_requests": 3.50,  # per million API calls
        "data_transfer_gb": 0.09,  # data transfer out
        "websocket_million_minutes": 0.25,  # WebSocket connections
    },
    
    "security": {
        "kms_key": 1.0,  # per key per month
        "kms_requests_10k": 0.03,  # per 10k requests
        "hsm_instance": 1500,  # per HSM instance per month
        "waf_million_requests": 0.60,  # per million requests
        "ddos_protection": 3000,  # flat fee per month
    },
    
    "observability": {
        "metrics_million_datapoints": 0.30,  # per million metrics
        "logs_gb_ingested": 0.50,  # per GB ingested
        "logs_gb_stored": 0.03,  # per GB stored per month
        "traces_million": 5.00,  # per million traces
        "apm_host": 31,  # per host per month
    },
    
    "backup_dr": {
        "snapshot_gb": 0.05,  # per GB-month
        "cross_region_replication_gb": 0.02,  # per GB transferred
        "pitr_enabled_multiplier": 1.2,  # multiplier for point-in-time recovery
    },
    
    "cicd": {
        "build_minutes": 0.008,  # per minute
        "artifact_storage_gb": 0.10,  # per GB-month
        "container_registry_gb": 0.10,  # per GB-month
        "pipeline_user": 10,  # per user per month
    },
}

def get_instance_size(customer_count):
    """Determine database instance size based on customer count"""
    if customer_count < 10000:
        return "small"
    elif customer_count < 50000:
        return "medium"
    elif customer_count < 200000:
        return "large"
    else:
        return "xlarge"

def get_compute_instances(tps):
    """Calculate number of compute instances needed based on TPS"""
    # Assume each instance can handle 100 TPS
    instances = max(3, (tps // 100) + 1)  # Minimum 3 for HA
    return instances

def apply_architecture_multiplier(cost, variant):
    """Apply cost multiplier based on architecture variant"""
    multipliers = {
        "single_region_3az": 1.0,
        "multi_region_3az": 2.8,  # ~3x for multi-region with replication
    }
    return cost * multipliers.get(variant, 1.0)