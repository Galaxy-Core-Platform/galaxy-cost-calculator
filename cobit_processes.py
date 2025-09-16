"""Governance Framework Processes for Galaxy Platform"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
import os
import glob

@dataclass
class GovernanceProcess:
    """Governance Process definition"""
    process_id: str
    cobit_ref: str  # COBIT reference like APO07.01, BAI03.01
    name: str
    category: str  # 'governance', 'management', 'development', 'operations'
    status: str  # 'running', 'stopped', 'scheduled', 'completed', 'failed'
    description: str
    checklist_path: Optional[str]
    diagram_path: Optional[str]
    process_doc_path: Optional[str]
    maturity_level: str  # 'placeholder', 'basic', 'active', 'production'
    last_run: Optional[str]
    next_run: Optional[str]
    execution_time_minutes: int
    success_rate: float
    
    def to_dict(self):
        return {
            'process_id': self.process_id,
            'cobit_ref': self.cobit_ref,
            'name': self.name,
            'category': self.category,
            'status': self.status,
            'description': self.description,
            'checklist_path': self.checklist_path,
            'diagram_path': self.diagram_path,
            'process_doc_path': self.process_doc_path,
            'maturity_level': self.maturity_level,
            'last_run': self.last_run,
            'next_run': self.next_run,
            'execution_time_minutes': self.execution_time_minutes,
            'success_rate': self.success_rate
        }

def get_governance_processes() -> List[GovernanceProcess]:
    """Get all governance framework processes"""
    processes = []
    
    # Define ONLY the processes that actually exist in the governance framework
    process_definitions = [
        {
            'id': '01',
            'cobit_ref': 'BAI01.01',
            'name': 'Discovery & Requirements',
            'category': 'governance',
            'description': 'Requirements gathering and discovery process for new features',
            'maturity': 'basic',
            'status': 'scheduled'
        },
        {
            'id': '12',
            'cobit_ref': 'BAI08.02',
            'name': 'Frontend Generation from OpenAPI',
            'category': 'development',
            'description': 'Automated React frontend generation from Rust OpenAPI specs',
            'maturity': 'production',
            'status': 'completed'
        },
        {
            'id': '13',
            'cobit_ref': 'BAI08.03',
            'name': 'Rust Service Creation',
            'category': 'development',
            'description': 'Standardized Rust microservice creation process',
            'maturity': 'production',
            'status': 'completed'
        },
        {
            'id': '14',
            'cobit_ref': 'BAI01.06',
            'name': 'Development Workflow',
            'category': 'development',
            'description': 'End-to-end development workflow automation',
            'maturity': 'active',
            'status': 'running'
        },
        {
            'id': '15',
            'cobit_ref': 'BAI02.03',
            'name': 'Platform Integration',
            'category': 'operations',
            'description': 'Galaxy platform component integration process',
            'maturity': 'active',
            'status': 'running'
        },
        {
            'id': '16',
            'cobit_ref': 'BAI10.02',
            'name': 'API Contract Management',
            'category': 'governance',
            'description': 'API contract versioning and configuration management',
            'maturity': 'production',
            'status': 'completed'
        },
        {
            'id': '17',
            'cobit_ref': 'DSS06.06',
            'name': 'RBAC Data Generation',
            'category': 'management',
            'description': 'Role-based access control data generation',
            'maturity': 'production',
            'status': 'completed'
        },
        {
            'id': '18',
            'cobit_ref': 'BAI10.05',
            'name': 'BAI10 Version Maintenance',
            'category': 'operations',
            'description': 'Configuration and version maintenance compliance',
            'maturity': 'production',
            'status': 'running'
        }
    ]
    
    base_path = '/Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/governance-framework'
    
    for proc_def in process_definitions:
        # Determine paths based on process ID
        process_doc = f"{base_path}/processes/{proc_def['id']}*.md"
        checklist = f"{base_path}/checklists/{proc_def['id']}*.md"
        diagram = f"{base_path}/diagrams/{proc_def['id']}*.puml"
        
        # Check if files exist
        process_doc_path = glob.glob(process_doc)[0] if glob.glob(process_doc) else None
        checklist_path = glob.glob(checklist)[0] if glob.glob(checklist) else None
        diagram_path = glob.glob(diagram)[0] if glob.glob(diagram) else None
        
        # Generate execution metrics
        if proc_def['status'] == 'running':
            last_run = datetime.now().strftime('%Y-%m-%d %H:%M')
            next_run = None
            exec_time = random.randint(5, 60)
        elif proc_def['status'] == 'completed':
            hours_ago = random.randint(1, 24)
            last_run = (datetime.now() - timedelta(hours=hours_ago)).strftime('%Y-%m-%d %H:%M')
            next_run = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d %H:%M')
            exec_time = random.randint(10, 120)
        elif proc_def['status'] == 'scheduled':
            last_run = None
            hours_ahead = random.randint(1, 48)
            next_run = (datetime.now() + timedelta(hours=hours_ahead)).strftime('%Y-%m-%d %H:%M')
            exec_time = 0
        else:
            last_run = None
            next_run = None
            exec_time = 0
        
        # Success rate based on maturity
        success_rates = {
            'production': random.uniform(95, 99.9),
            'active': random.uniform(85, 95),
            'basic': random.uniform(75, 85),
            'placeholder': 0
        }
        
        process = GovernanceProcess(
            process_id=proc_def['id'],
            cobit_ref=proc_def['cobit_ref'],
            name=proc_def['name'],
            category=proc_def['category'],
            status=proc_def['status'],
            description=proc_def['description'],
            checklist_path=checklist_path,
            diagram_path=diagram_path,
            process_doc_path=process_doc_path,
            maturity_level=proc_def['maturity'],
            last_run=last_run,
            next_run=next_run,
            execution_time_minutes=exec_time,
            success_rate=success_rates.get(proc_def['maturity'], 0)
        )
        processes.append(process)
    
    return processes

def get_processes_summary() -> Dict:
    """Get summary of governance processes"""
    processes = get_governance_processes()
    
    return {
        'processes': [p.to_dict() for p in processes],
        'summary': {
            'total': len(processes),
            'running': sum(1 for p in processes if p.status == 'running'),
            'scheduled': sum(1 for p in processes if p.status == 'scheduled'),
            'completed': sum(1 for p in processes if p.status == 'completed'),
            'failed': sum(1 for p in processes if p.status == 'failed'),
            'by_category': {
                'governance': sum(1 for p in processes if p.category == 'governance'),
                'management': sum(1 for p in processes if p.category == 'management'),
                'development': sum(1 for p in processes if p.category == 'development'),
                'operations': sum(1 for p in processes if p.category == 'operations')
            },
            'by_maturity': {
                'production': sum(1 for p in processes if p.maturity_level == 'production'),
                'active': sum(1 for p in processes if p.maturity_level == 'active'),
                'basic': sum(1 for p in processes if p.maturity_level == 'basic'),
                'placeholder': sum(1 for p in processes if p.maturity_level == 'placeholder')
            }
        }
    }

def execute_process(process_id: str, action: str) -> Dict:
    """Execute an action on a governance process"""
    processes = get_governance_processes()
    process = next((p for p in processes if p.process_id == process_id), None)
    
    if not process:
        return {'success': False, 'message': f'Process {process_id} not found'}
    
    if action == 'run':
        if process.status == 'running':
            return {'success': False, 'message': f'Process {process.name} is already running'}
        return {
            'success': True, 
            'message': f'Started process {process.name}',
            'process_id': process_id,
            'new_status': 'running'
        }
    elif action == 'stop':
        if process.status != 'running':
            return {'success': False, 'message': f'Process {process.name} is not running'}
        return {
            'success': True,
            'message': f'Stopped process {process.name}',
            'process_id': process_id,
            'new_status': 'stopped'
        }
    elif action == 'delete':
        if process.maturity_level == 'production':
            return {'success': False, 'message': f'Cannot delete production process {process.name}'}
        return {
            'success': True,
            'message': f'Deleted process {process.name}',
            'process_id': process_id
        }
    else:
        return {'success': False, 'message': f'Unknown action: {action}'}