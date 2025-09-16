"""Services technical information for Galaxy platform monitoring"""

from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime, timedelta
import random

@dataclass
class ServiceStatus:
    """Service health and monitoring information"""
    service_name: str
    status: str  # 'healthy', 'warning', 'critical'
    uptime_percent: float
    response_time_ms: int
    requests_per_min: int
    error_rate: float
    cpu_usage: float
    memory_usage: float
    active_connections: int
    version: str
    last_deploy: str
    region: str
    instances: int
    alerts: int
    
    def to_dict(self):
        return {
            'service_name': self.service_name,
            'status': self.status,
            'uptime_percent': self.uptime_percent,
            'response_time_ms': self.response_time_ms,
            'requests_per_min': self.requests_per_min,
            'error_rate': self.error_rate,
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'active_connections': self.active_connections,
            'version': self.version,
            'last_deploy': self.last_deploy,
            'region': self.region,
            'instances': self.instances,
            'alerts': self.alerts
        }

def generate_service_status() -> List[ServiceStatus]:
    """Generate realistic service status for all microservices"""
    services = []
    
    service_configs = {
        'Proxima': {'version': '2.4.1', 'instances': 4, 'base_rpm': 12000},
        'Titan': {'version': '2.3.8', 'instances': 3, 'base_rpm': 8000},
        'Orion': {'version': '2.4.0', 'instances': 3, 'base_rpm': 6000},
        'Quasar': {'version': '2.2.5', 'instances': 2, 'base_rpm': 4000},
        'Krypton': {'version': '2.3.1', 'instances': 2, 'base_rpm': 3500},
        'Aster': {'version': '2.4.2', 'instances': 2, 'base_rpm': 3000},
        'Polaris': {'version': '2.1.9', 'instances': 3, 'base_rpm': 5500},
        'Nebula': {'version': '2.3.4', 'instances': 2, 'base_rpm': 2500},
        'Aphelion': {'version': '2.2.7', 'instances': 4, 'base_rpm': 9000},
        'Pulsar': {'version': '2.4.0', 'instances': 3, 'base_rpm': 7000},
        'Draco': {'version': '2.3.6', 'instances': 2, 'base_rpm': 1500},
        'Horizon': {'version': '2.2.3', 'instances': 2, 'base_rpm': 2000}
    }
    
    for service_name, config in service_configs.items():
        # Determine service status with weighted probability
        status_choice = random.choices(
            ['healthy', 'warning', 'critical'],
            weights=[0.85, 0.12, 0.03]
        )[0]
        
        # Generate metrics based on status
        if status_choice == 'healthy':
            uptime = round(random.uniform(99.5, 99.99), 2)
            response_time = random.randint(50, 150)
            error_rate = round(random.uniform(0.01, 0.5), 2)
            cpu_usage = round(random.uniform(20, 60), 1)
            memory_usage = round(random.uniform(30, 70), 1)
            alerts = 0
        elif status_choice == 'warning':
            uptime = round(random.uniform(98.5, 99.5), 2)
            response_time = random.randint(150, 300)
            error_rate = round(random.uniform(0.5, 2.0), 2)
            cpu_usage = round(random.uniform(60, 85), 1)
            memory_usage = round(random.uniform(70, 85), 1)
            alerts = random.randint(1, 3)
        else:  # critical
            uptime = round(random.uniform(95.0, 98.5), 2)
            response_time = random.randint(300, 500)
            error_rate = round(random.uniform(2.0, 5.0), 2)
            cpu_usage = round(random.uniform(85, 95), 1)
            memory_usage = round(random.uniform(85, 95), 1)
            alerts = random.randint(3, 5)
        
        # Calculate requests with some variance
        requests_per_min = config['base_rpm'] + random.randint(-500, 500)
        
        # Generate last deploy time
        days_ago = random.randint(0, 30)
        last_deploy = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        
        service = ServiceStatus(
            service_name=service_name,
            status=status_choice,
            uptime_percent=uptime,
            response_time_ms=response_time,
            requests_per_min=requests_per_min,
            error_rate=error_rate,
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            active_connections=random.randint(10, 200),
            version=config['version'],
            last_deploy=last_deploy,
            region='us-east-1',
            instances=config['instances'],
            alerts=alerts
        )
        services.append(service)
    
    return services

def get_services_summary() -> Dict:
    """Get summary of all services with detailed metrics"""
    services = generate_service_status()
    
    # Calculate summary statistics
    healthy_count = sum(1 for s in services if s.status == 'healthy')
    warning_count = sum(1 for s in services if s.status == 'warning')
    critical_count = sum(1 for s in services if s.status == 'critical')
    
    response_times = [s.response_time_ms for s in services]
    avg_response = sum(response_times) / len(response_times)
    p95_response = sorted(response_times)[int(len(response_times) * 0.95)]
    
    # Generate some recent alerts for display
    recent_alerts = []
    for service in services:
        if service.alerts > 0:
            if service.status == 'warning':
                recent_alerts.append({
                    'service': service.service_name,
                    'severity': 'warning',
                    'message': f'High response time detected ({service.response_time_ms}ms)',
                    'timestamp': datetime.now().strftime('%H:%M')
                })
            elif service.status == 'critical':
                recent_alerts.append({
                    'service': service.service_name,
                    'severity': 'error',
                    'message': f'Service degradation - Error rate {service.error_rate}%',
                    'timestamp': datetime.now().strftime('%H:%M')
                })
    
    return {
        'services': [s.to_dict() for s in services],
        'summary': {
            'total_services': len(services),
            'healthy_count': healthy_count,
            'warning_count': warning_count,
            'critical_count': critical_count,
            'avg_response_time': int(avg_response),
            'p95_response_time': p95_response,
            'total_requests_per_min': sum(s.requests_per_min for s in services),
            'total_alerts': sum(s.alerts for s in services),
            'recent_alerts': recent_alerts[:5]  # Show only last 5 alerts
        }
    }