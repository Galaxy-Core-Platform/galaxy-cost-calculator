"""
Database Technical Information for Galaxy Platform Services
Provides detailed technical specifications for each service's database
"""

from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime

@dataclass
class DatabaseInfo:
    """Database technical specifications"""
    service_name: str
    db_engine: str
    db_version: str
    instance_type: str
    storage_type: str
    storage_gb: int
    tables_count: int
    total_records: int
    max_table_records: int
    max_table_name: str
    backup_retention_days: int
    multi_az: bool
    encryption: bool
    monitoring: bool
    connections_limit: int
    iops: int
    cpu_cores: int
    memory_gb: float
    
    def to_dict(self):
        return {
            'service_name': self.service_name,
            'db_engine': self.db_engine,
            'db_version': self.db_version,
            'instance_type': self.instance_type,
            'storage_type': self.storage_type,
            'storage_gb': self.storage_gb,
            'tables_count': self.tables_count,
            'total_records': self.total_records,
            'max_table_records': self.max_table_records,
            'max_table_name': self.max_table_name,
            'backup_retention_days': self.backup_retention_days,
            'multi_az': self.multi_az,
            'encryption': self.encryption,
            'monitoring': self.monitoring,
            'connections_limit': self.connections_limit,
            'iops': self.iops,
            'cpu_cores': self.cpu_cores,
            'memory_gb': self.memory_gb
        }

# Database specifications for each service
DATABASES = {
    'proxima': DatabaseInfo(
        service_name='Proxima',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.r6g.xlarge',
        storage_type='gp3',
        storage_gb=500,
        tables_count=52,
        total_records=245_000_000,
        max_table_records=120_000_000,
        max_table_name='transactions',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=200,
        iops=12000,
        cpu_cores=4,
        memory_gb=32
    ),
    'titan': DatabaseInfo(
        service_name='Titan',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.r6g.large',
        storage_type='gp3',
        storage_gb=200,
        tables_count=18,
        total_records=95_000_000,
        max_table_records=50_000_000,
        max_table_name='payment_transactions',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=100,
        iops=6000,
        cpu_cores=2,
        memory_gb=16
    ),
    'orion': DatabaseInfo(
        service_name='Orion',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.medium',
        storage_type='gp3',
        storage_gb=100,
        tables_count=23,
        total_records=12_500_000,
        max_table_records=5_000_000,
        max_table_name='customers',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=50,
        iops=3000,
        cpu_cores=2,
        memory_gb=4
    ),
    'quasar': DatabaseInfo(
        service_name='Quasar',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.small',
        storage_type='gp3',
        storage_gb=50,
        tables_count=15,
        total_records=3_200_000,
        max_table_records=1_500_000,
        max_table_name='kyc_verifications',
        backup_retention_days=30,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=30,
        iops=3000,
        cpu_cores=1,
        memory_gb=2
    ),
    'krypton': DatabaseInfo(
        service_name='Krypton',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.small',
        storage_type='gp3',
        storage_gb=30,
        tables_count=12,
        total_records=850_000,
        max_table_records=400_000,
        max_table_name='collaterals',
        backup_retention_days=7,
        multi_az=False,
        encryption=True,
        monitoring=True,
        connections_limit=20,
        iops=3000,
        cpu_cores=1,
        memory_gb=2
    ),
    'aster': DatabaseInfo(
        service_name='Aster',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.small',
        storage_type='gp3',
        storage_gb=20,
        tables_count=8,
        total_records=2_100_000,
        max_table_records=800_000,
        max_table_name='approval_workflows',
        backup_retention_days=7,
        multi_az=False,
        encryption=True,
        monitoring=True,
        connections_limit=20,
        iops=3000,
        cpu_cores=1,
        memory_gb=2
    ),
    'polaris': DatabaseInfo(
        service_name='Polaris',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.medium',
        storage_type='gp3',
        storage_gb=50,
        tables_count=45,
        total_records=8_500_000,
        max_table_records=2_000_000,
        max_table_name='configurations',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=50,
        iops=3000,
        cpu_cores=2,
        memory_gb=4
    ),
    'draco': DatabaseInfo(
        service_name='Draco',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.medium',
        storage_type='gp3',
        storage_gb=80,
        tables_count=28,
        total_records=15_000_000,
        max_table_records=5_000_000,
        max_table_name='permissions',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=50,
        iops=3000,
        cpu_cores=2,
        memory_gb=4
    ),
    'nebula': DatabaseInfo(
        service_name='Nebula',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.small',
        storage_type='gp3',
        storage_gb=40,
        tables_count=6,
        total_records=4_200_000,
        max_table_records=3_000_000,
        max_table_name='contact_logs',
        backup_retention_days=7,
        multi_az=False,
        encryption=True,
        monitoring=True,
        connections_limit=20,
        iops=3000,
        cpu_cores=1,
        memory_gb=2
    ),
    'aphelion': DatabaseInfo(
        service_name='Aphelion',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.r6g.large',
        storage_type='gp3',
        storage_gb=300,
        tables_count=35,
        total_records=180_000_000,
        max_table_records=80_000_000,
        max_table_name='analytics_events',
        backup_retention_days=30,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=100,
        iops=9000,
        cpu_cores=2,
        memory_gb=16
    ),
    'pulsar': DatabaseInfo(
        service_name='Pulsar',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.medium',
        storage_type='gp3',
        storage_gb=60,
        tables_count=10,
        total_records=25_000_000,
        max_table_records=20_000_000,
        max_table_name='webhook_events',
        backup_retention_days=7,
        multi_az=True,
        encryption=True,
        monitoring=True,
        connections_limit=50,
        iops=3000,
        cpu_cores=2,
        memory_gb=4
    ),
    'horizon': DatabaseInfo(
        service_name='Horizon',
        db_engine='PostgreSQL',
        db_version='14.9',
        instance_type='db.t4g.small',
        storage_type='gp3',
        storage_gb=20,
        tables_count=12,
        total_records=500_000,
        max_table_records=200_000,
        max_table_name='user_sessions',
        backup_retention_days=7,
        multi_az=False,
        encryption=True,
        monitoring=True,
        connections_limit=30,
        iops=3000,
        cpu_cores=1,
        memory_gb=2
    )
}

def get_all_databases() -> List[Dict]:
    """Get all database information"""
    return [db.to_dict() for db in DATABASES.values()]

def get_database_by_service(service_name: str) -> Dict:
    """Get database information for a specific service"""
    service_key = service_name.lower()
    if service_key in DATABASES:
        return DATABASES[service_key].to_dict()
    return None

def get_database_summary() -> Dict:
    """Get summary statistics for all databases"""
    total_storage = sum(db.storage_gb for db in DATABASES.values())
    total_tables = sum(db.tables_count for db in DATABASES.values())
    total_records = sum(db.total_records for db in DATABASES.values())
    total_connections = sum(db.connections_limit for db in DATABASES.values())
    
    return {
        'total_databases': len(DATABASES),
        'total_storage_gb': total_storage,
        'total_tables': total_tables,
        'total_records': total_records,
        'total_connections_limit': total_connections,
        'engines': list(set(db.db_engine for db in DATABASES.values())),
        'multi_az_count': sum(1 for db in DATABASES.values() if db.multi_az),
        'encrypted_count': sum(1 for db in DATABASES.values() if db.encryption)
    }

def get_service_status() -> Dict:
    """Get service status information"""
    import random
    
    services = [
        'Proxima', 'Titan', 'Orion', 'Quasar', 'Krypton', 'Aster',
        'Polaris', 'Draco', 'Nebula', 'Aphelion', 'Pulsar', 'Horizon'
    ]
    
    statuses = []
    for service in services:
        # Simulate service status (in production, this would connect to real monitoring)
        status = random.choices(
            ['healthy', 'warning', 'critical'],
            weights=[0.85, 0.12, 0.03]
        )[0]
        
        uptime = random.uniform(99.5, 99.99) if status == 'healthy' else random.uniform(95.0, 99.5)
        response_time = random.uniform(50, 200) if status == 'healthy' else random.uniform(200, 500)
        
        statuses.append({
            'name': service,
            'status': status,
            'uptime_percent': round(uptime, 2),
            'response_time_ms': round(response_time),
            'last_check': datetime.now().isoformat()
        })
    
    return {
        'services': statuses,
        'healthy_count': sum(1 for s in statuses if s['status'] == 'healthy'),
        'warning_count': sum(1 for s in statuses if s['status'] == 'warning'),
        'critical_count': sum(1 for s in statuses if s['status'] == 'critical'),
        'total_count': len(statuses)
    }