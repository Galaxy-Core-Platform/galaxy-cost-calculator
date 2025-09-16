"""
Processes Information for Galaxy Platform Services
Provides detailed information about running processes and jobs
"""

from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime, timedelta
import random

@dataclass
class ProcessInfo:
    """Process/Job specifications"""
    process_id: str
    service_name: str
    process_type: str  # 'batch', 'streaming', 'api', 'worker', 'scheduler'
    status: str  # 'running', 'idle', 'processing', 'failed'
    cpu_usage_percent: float
    memory_usage_mb: int
    threads: int
    uptime_hours: float
    processed_items: int
    pending_items: int
    error_count: int
    last_heartbeat: str
    
    def to_dict(self):
        return {
            'process_id': self.process_id,
            'service_name': self.service_name,
            'process_type': self.process_type,
            'process_name': f"{self.service_name} {self.process_type.title()}",
            'status': self.status,
            'cpu_usage_percent': self.cpu_usage_percent,
            'memory_usage_mb': self.memory_usage_mb,
            'threads': self.threads,
            'start_time': f"{int(self.uptime_hours)}h ago",
            'runtime_minutes': int(self.uptime_hours * 60),
            'uptime_hours': self.uptime_hours,
            'processed_items': self.processed_items,
            'pending_items': self.pending_items,
            'error_count': self.error_count,
            'last_heartbeat': self.last_heartbeat
        }

def generate_processes() -> List[ProcessInfo]:
    """Generate process information for all services"""
    processes = []
    
    # Service process configurations
    service_configs = {
        'Proxima': {
            'processes': [
                ('api', 4),  # 4 API instances
                ('batch', 2),  # 2 batch processors
                ('worker', 3)  # 3 workers
            ]
        },
        'Titan': {
            'processes': [
                ('api', 3),
                ('streaming', 2),
                ('worker', 2)
            ]
        },
        'Orion': {
            'processes': [
                ('api', 2),
                ('worker', 1)
            ]
        },
        'Quasar': {
            'processes': [
                ('api', 1),
                ('batch', 1),
                ('scheduler', 1)
            ]
        },
        'Krypton': {
            'processes': [
                ('api', 1),
                ('worker', 1)
            ]
        },
        'Aster': {
            'processes': [
                ('api', 1),
                ('worker', 1),
                ('scheduler', 1)
            ]
        },
        'Polaris': {
            'processes': [
                ('api', 2),
                ('worker', 1)
            ]
        },
        'Draco': {
            'processes': [
                ('api', 2),
                ('worker', 2)
            ]
        },
        'Nebula': {
            'processes': [
                ('api', 1),
                ('batch', 1)
            ]
        },
        'Aphelion': {
            'processes': [
                ('streaming', 3),
                ('batch', 2),
                ('worker', 2)
            ]
        },
        'Pulsar': {
            'processes': [
                ('api', 2),
                ('streaming', 2),
                ('worker', 1)
            ]
        },
        'Horizon': {
            'processes': [
                ('api', 2)
            ]
        }
    }
    
    for service_name, config in service_configs.items():
        for process_type, count in config['processes']:
            for i in range(count):
                # Generate realistic metrics
                status = random.choices(
                    ['running', 'idle', 'processing'],
                    weights=[0.6, 0.3, 0.1]
                )[0]
                
                cpu_usage = random.uniform(10, 80) if status == 'running' else random.uniform(1, 10)
                memory_usage = random.randint(100, 2000) if process_type == 'batch' else random.randint(50, 500)
                
                process = ProcessInfo(
                    process_id=f"{service_name.lower()}-{process_type}-{i+1:02d}",
                    service_name=service_name,
                    process_type=process_type,
                    status=status,
                    cpu_usage_percent=round(cpu_usage, 1),
                    memory_usage_mb=memory_usage,
                    threads=random.randint(1, 20),
                    uptime_hours=round(random.uniform(0.1, 720), 1),
                    processed_items=random.randint(1000, 1000000),
                    pending_items=random.randint(0, 10000) if status == 'processing' else 0,
                    error_count=random.randint(0, 10),
                    last_heartbeat=datetime.now().isoformat()
                )
                processes.append(process)
    
    return processes

def get_processes_summary() -> Dict:
    """Get summary of all processes"""
    processes = generate_processes()
    
    return {
        'total_processes': len(processes),
        'running_count': sum(1 for p in processes if p.status == 'running'),
        'idle_count': sum(1 for p in processes if p.status == 'idle'),
        'processing_count': sum(1 for p in processes if p.status == 'processing'),
        'total_cpu_usage': round(sum(p.cpu_usage_percent for p in processes), 1),
        'total_memory_mb': sum(p.memory_usage_mb for p in processes),
        'total_processed': sum(p.processed_items for p in processes),
        'total_pending': sum(p.pending_items for p in processes),
        'total_errors': sum(p.error_count for p in processes),
        'by_type': {
            'api': sum(1 for p in processes if p.process_type == 'api'),
            'batch': sum(1 for p in processes if p.process_type == 'batch'),
            'streaming': sum(1 for p in processes if p.process_type == 'streaming'),
            'worker': sum(1 for p in processes if p.process_type == 'worker'),
            'scheduler': sum(1 for p in processes if p.process_type == 'scheduler')
        },
        'processes': [p.to_dict() for p in processes]
    }

def get_batch_jobs() -> List[Dict]:
    """Get information about batch jobs"""
    jobs = []
    
    batch_jobs = [
        ('Daily Reconciliation', 'Proxima', 'completed', '02:00', '02:45', 1_500_000),
        ('Transaction Settlement', 'Titan', 'running', '03:00', None, 850_000),
        ('KYC Verification Batch', 'Quasar', 'scheduled', '04:00', None, 0),
        ('Analytics Aggregation', 'Aphelion', 'completed', '01:00', '01:30', 2_000_000),
        ('Webhook Retry', 'Pulsar', 'running', '03:30', None, 45_000),
        ('Report Generation', 'Proxima', 'scheduled', '05:00', None, 0),
        ('Data Archival', 'Nebula', 'completed', '00:00', '00:15', 100_000),
        ('Permission Sync', 'Draco', 'scheduled', '06:00', None, 0)
    ]
    
    for idx, (job_name, service, status, start_time, end_time, records) in enumerate(batch_jobs):
        # Calculate runtime and progress for running jobs
        if status == 'running':
            runtime_minutes = random.randint(10, 120)
            total_records = records + random.randint(100_000, 500_000)
            progress = (records / total_records) * 100
            est_completion = f"{(datetime.now() + timedelta(minutes=random.randint(10, 60))).strftime('%H:%M')}"
        else:
            runtime_minutes = 45 if status == 'completed' else 0
            total_records = records
            progress = 100 if status == 'completed' else 0
            est_completion = None
            
        job = {
            'job_id': f'job-{idx+1:03d}',
            'job_name': job_name,
            'service_name': service,
            'status': status,
            'started_at': start_time,
            'runtime_minutes': runtime_minutes,
            'progress_percent': round(progress, 1),
            'records_processed': records,
            'records_total': total_records,
            'estimated_completion': est_completion,
            'next_run': f"{(datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')} {start_time}" if status != 'running' else None
        }
        jobs.append(job)
    
    return jobs