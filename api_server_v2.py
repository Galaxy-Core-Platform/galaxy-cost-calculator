#!/usr/bin/env python3
"""
Enhanced Flask API server for Galaxy Cost Calculator
Supports customer segments and YAML configuration
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import yaml
import json
import os
from pathlib import Path
from typing import Dict, List
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import segment operations model
from segment_operations_model import (
    get_operation_profiles,
    calculate_total_volumes,
    generate_volume_config
)

# Import technical information modules
try:
    from database_technical_info import (
        get_all_databases,
        get_database_summary,
        get_service_status
    )
    from documentation_manager import (
        get_documentation_summary,
        run_lint,
        build_docs
    )
    from processes_info import (
        get_processes_summary,
        get_batch_jobs
    )
    TECHNICAL_MODULES_AVAILABLE = True
except ImportError:
    TECHNICAL_MODULES_AVAILABLE = False

# Import database inspector separately
try:
    from database_inspector import DatabaseInspector
    DATABASE_INSPECTOR_AVAILABLE = True
    print("Database Inspector loaded successfully")
except ImportError as e:
    DATABASE_INSPECTOR_AVAILABLE = False
    print(f"Warning: Database Inspector not available: {e}")

# Import original calculation functions
from galaxy_cloud_calculator import (
    load_cloud_pricing,
    calculate_complete_galaxy_metrics,
    calculate_with_cloud_pricing
)

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Enable CORS for React frontend

# Configuration file paths
CONFIG_DIR = Path(__file__).parent
VOLUME_CONFIG_FILE = CONFIG_DIR / 'volume_config.yaml'
PRICING_FILES = {
    'aws': CONFIG_DIR / 'pricing_aws.yaml',
    'gcp': CONFIG_DIR / 'pricing_gcp.yaml',
    'azure': CONFIG_DIR / 'pricing_azure.yaml'
}

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({'message': 'Frontend not built. Use development server on port 3000'})

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Galaxy Cost Calculator API v2'})

@app.route('/api/databases/all', methods=['GET'])
def get_databases():
    """Get all database information"""
    try:
        # Try to use real PostgreSQL data first
        if not DATABASE_INSPECTOR_AVAILABLE:
            raise Exception("Database Inspector not available")
        
        db_inspector = DatabaseInspector()
        
        # Get Galaxy databases stats
        galaxy_stats = db_inspector.get_galaxy_databases_stats()
        
        # Get summary statistics
        summary = db_inspector.get_summary_stats()
        
        # Transform to expected format
        databases = []
        for stat in galaxy_stats:
            databases.append({
                'name': stat['name'],
                'service': stat['service'],
                'status': stat['status'],
                'total_tables': stat['total_tables'],
                'total_rows': stat['total_rows'],
                'total_size_pretty': stat.get('total_size_pretty', '0 B'),
                'total_size': stat.get('total_size', 0),
                'connections': stat.get('connections', 0),
                'max_connections': summary['max_connections'],
                'version': stat.get('version', 'Unknown'),
                'indexes': stat.get('indexes', 0),
                'largest_tables': stat.get('largest_tables', [])
            })
        
        return jsonify({
            'databases': databases,
            'summary': {
                'total_databases': summary['total_databases'],
                'galaxy_databases': summary['galaxy_databases'],
                'total_size': summary['total_size_pretty'],
                'total_connections': f"{summary['total_connections']}/{summary['max_connections']}",
                'total_tables': summary['total_tables'],
                'total_records': summary['total_rows'],
                'postgres_version': summary['postgres_version']
            }
        })
    except Exception as e:
        # Fallback to mock data if PostgreSQL is not available
        logger.warning(f"Failed to get real database data: {e}")
        if TECHNICAL_MODULES_AVAILABLE:
            try:
                databases = get_all_databases()
                summary = get_database_summary()
                return jsonify({
                    'databases': databases,
                    'summary': summary
                })
            except:
                pass
        return jsonify({'error': str(e)}), 500

@app.route('/api/databases/<database_name>', methods=['GET'])
def get_database_details(database_name):
    """Get detailed information for a specific database"""
    try:
        db_inspector = DatabaseInspector()
        stats = db_inspector.get_database_stats(database_name)
        
        if not stats or not stats.get('name'):
            return jsonify({'error': f'Database {database_name} not found'}), 404
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting database details: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/status', methods=['GET'])
def get_services_status():
    """Get service status information"""
    try:
        from services_info import get_services_summary
        status = get_services_summary()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/health/<service_name>', methods=['GET'])
def check_service_health(service_name):
    """Real-time health check for a specific service"""
    import requests
    import socket
    import time
    import json
    import os
    
    # Load service port configuration from file
    config_file = os.path.join(os.path.dirname(__file__), 'galaxy_services_ports.json')
    try:
        with open(config_file, 'r') as f:
            port_config = json.load(f)
    except:
        # Fallback configuration if file not found
        port_config = {
            'services': {
                'proxima': {'port': 8080, 'health_path': '/health'},
                'titan': {'port': 5030, 'health_path': '/health'},
                'orion': {'port': 5010, 'health_path': '/health'}
            },
            'display_name_mapping': {}
        }
    
    # Map display name to service key
    service_name_mapped = port_config.get('display_name_mapping', {}).get(service_name, service_name.lower())
    
    # Get service configuration
    if service_name_mapped not in port_config['services']:
        service_name_mapped = service_name.lower()
    
    if service_name_mapped not in port_config['services']:
        return jsonify({'error': 'Unknown service', 'service': service_name}), 404
    
    service_config = port_config['services'][service_name_mapped]
    service_endpoints = {
        service_name_mapped: {
            'host': 'localhost',
            'port': service_config['port'],
            'path': service_config.get('health_path', '/health')
        }
    }
    
    service_name_lower = service_name_mapped
    
    if service_name_lower not in service_endpoints:
        return jsonify({'error': 'Unknown service', 'service': service_name}), 404
    
    service_config = service_endpoints[service_name_lower]
    endpoint_url = f"http://{service_config['host']}:{service_config['port']}{service_config['path']}"
    
    # Prepare health status response
    health_status = {
        'service': service_name,
        'endpoint': endpoint_url,
        'timestamp': time.time(),
        'status': 'unknown',
        'response_time_ms': None,
        'details': {}
    }
    
    # Try to check if the service port is open
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((service_config['host'], service_config['port']))
        sock.close()
        
        if result == 0:
            # Port is open, try actual health check
            try:
                start_time = time.time()
                response = requests.get(endpoint_url, timeout=2)
                response_time = (time.time() - start_time) * 1000
                
                health_status['response_time_ms'] = round(response_time, 2)
                
                if response.status_code == 200:
                    health_status['status'] = 'healthy'
                    try:
                        health_status['details'] = response.json()
                    except:
                        health_status['details'] = {'message': 'Service is running'}
                else:
                    health_status['status'] = 'unhealthy'
                    health_status['details'] = {'status_code': response.status_code}
            except requests.exceptions.Timeout:
                health_status['status'] = 'timeout'
                health_status['details'] = {'message': 'Health check timed out'}
            except requests.exceptions.ConnectionError:
                health_status['status'] = 'degraded'
                health_status['details'] = {'message': 'Port open but health endpoint not responding'}
        else:
            # Port is not open
            health_status['status'] = 'down'
            health_status['details'] = {'message': f'Service port {service_config["port"]} is not accessible'}
    except Exception as e:
        health_status['status'] = 'error'
        health_status['details'] = {'error': str(e)}
    
    # Don't override with fake data - show real status
    
    return jsonify(health_status)

@app.route('/api/processes/all', methods=['GET'])
def get_processes():
    """Get all process information"""
    if not TECHNICAL_MODULES_AVAILABLE:
        return jsonify({'error': 'Technical modules not available'}), 503
    try:
        data = get_processes_summary()
        # Restructure response to match frontend expectations
        response = {
            'processes': data.get('processes', []),
            'summary': {
                'total_processes': data.get('total_processes', 0),
                'running_count': data.get('running_count', 0),
                'idle_count': data.get('idle_count', 0),
                'processing_count': data.get('processing_count', 0),
                'avg_cpu_usage': data.get('total_cpu_usage', 0) / max(data.get('total_processes', 1), 1),
                'total_memory_mb': data.get('total_memory_mb', 0),
                'by_type': data.get('by_type', {})
            }
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/processes/batch-jobs', methods=['GET'])
def get_batch():
    """Get batch job information"""
    if not TECHNICAL_MODULES_AVAILABLE:
        return jsonify({'error': 'Technical modules not available'}), 503
    try:
        jobs = get_batch_jobs()
        return jsonify({'batch_jobs': jobs})  # Changed from 'jobs' to 'batch_jobs'
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cobit/processes', methods=['GET'])
def get_cobit_processes():
    """Get COBIT framework processes"""
    try:
        from cobit_processes import get_processes_summary
        summary = get_processes_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cobit/process/<process_id>/<action>', methods=['POST'])
def execute_cobit_process(process_id, action):
    """Execute action on COBIT process"""
    try:
        from cobit_processes import execute_process
        result = execute_process(process_id, action)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/governance/document', methods=['GET'])
def serve_governance_document():
    """Serve governance framework documents"""
    import mimetypes
    from flask import send_file, request
    
    try:
        filepath = request.args.get('path', '')
        if not filepath:
            return jsonify({'error': 'No file path provided'}), 400
            
        # For PlantUML files, try to serve PNG version
        if filepath.endswith('.puml'):
            # Try to find the corresponding PNG file
            png_path = filepath.replace('.puml', '.png')
            if os.path.exists(png_path):
                filepath = png_path
            else:
                # Try without the full path, just the filename pattern
                import glob
                base_dir = os.path.dirname(filepath)
                base_name = os.path.basename(filepath).replace('.puml', '')
                png_files = glob.glob(f"{base_dir}/{base_name}*.png")
                if png_files:
                    filepath = png_files[0]
                else:
                    return jsonify({'error': 'PNG version not found'}), 404
        
        # Security check - ensure file exists and is readable
        if not os.path.exists(filepath):
            return jsonify({'error': f'File not found: {filepath}'}), 404
            
        # Get MIME type
        mime_type = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
        
        # For images, ensure proper content type
        if filepath.endswith('.png'):
            mime_type = 'image/png'
        elif filepath.endswith('.jpg') or filepath.endswith('.jpeg'):
            mime_type = 'image/jpeg'
        
        return send_file(filepath, mimetype=mime_type, as_attachment=False)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/segments', methods=['GET'])
def get_segments():
    """Get current customer segment configuration"""
    try:
        if VOLUME_CONFIG_FILE.exists():
            with open(VOLUME_CONFIG_FILE, 'r') as f:
                config = yaml.safe_load(f)
                return jsonify(config.get('customer_segments', {}))
        else:
            # Return default segments
            return jsonify({
                'retail': {
                    'count': 1000000,
                    'description': 'Individual retail banking customers',
                    'characteristics': {
                        'avg_transactions_month': 100,
                        'avg_contacts_month': 2
                    }
                },
                'sme': {
                    'count': 100000,
                    'description': 'Small and medium enterprise customers',
                    'characteristics': {
                        'avg_transactions_month': 500,
                        'avg_contacts_month': 8
                    }
                },
                'corporate': {
                    'count': 10000,
                    'description': 'Large corporate customers',
                    'characteristics': {
                        'avg_transactions_month': 5000,
                        'avg_contacts_month': 20
                    }
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/segments', methods=['POST'])
def update_segments():
    """Update customer segment configuration"""
    try:
        data = request.json
        
        # Validate input
        required_segments = ['retail', 'sme', 'corporate']
        for segment in required_segments:
            if segment not in data:
                return jsonify({'error': f'Missing segment: {segment}'}), 400
            if 'count' not in data[segment]:
                return jsonify({'error': f'Missing count for segment: {segment}'}), 400
        
        # Generate new configuration
        retail_count = data['retail']['count']
        sme_count = data['sme']['count']
        corporate_count = data['corporate']['count']
        
        config = generate_volume_config(retail_count, sme_count, corporate_count, str(VOLUME_CONFIG_FILE))
        
        return jsonify({
            'message': 'Segments updated successfully',
            'segments': config['customer_segments']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/operations', methods=['GET'])
def get_operations():
    """Get all operation profiles with segment-specific volumes"""
    try:
        profiles = get_operation_profiles()
        
        # Load current segment counts
        segments = {'retail': 1000000, 'sme': 100000, 'corporate': 10000}
        if VOLUME_CONFIG_FILE.exists():
            with open(VOLUME_CONFIG_FILE, 'r') as f:
                config = yaml.safe_load(f)
                if 'customer_segments' in config:
                    for seg in segments.keys():
                        if seg in config['customer_segments']:
                            segments[seg] = config['customer_segments'][seg]['count']
        
        operations = []
        for profile in profiles:
            operations.append({
                'service': profile.service,
                'operation': profile.operation,
                'description': profile.description,
                'retail_volume': profile.retail_volume,
                'sme_volume': profile.sme_volume,
                'corporate_volume': profile.corporate_volume,
                'bytes_per_operation': profile.bytes_per_operation,
                'is_write': profile.is_write_operation,
                'total_volume': (
                    profile.retail_volume * segments['retail'] +
                    profile.sme_volume * segments['sme'] +
                    profile.corporate_volume * segments['corporate']
                )
            })
        
        return jsonify({
            'operations': operations,
            'segments': segments
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calculate-segment', methods=['POST'])
def calculate_segment_cost():
    """Calculate infrastructure costs based on customer segments"""
    try:
        data = request.json
        
        # Extract segment counts
        retail_count = data.get('retail', 1000000)
        sme_count = data.get('sme', 100000)
        corporate_count = data.get('corporate', 10000)
        architecture = data.get('architecture', 'single_region_3az')
        provider = data.get('provider', 'gcp')
        include_nonprod = data.get('includeNonProd', True)
        volume_multiplier = data.get('volumeMultiplier', 1.0)
        
        # Calculate total volumes
        totals = calculate_total_volumes(retail_count, sme_count, corporate_count, volume_multiplier)
        
        # Calculate total customer count
        total_customers = retail_count + sme_count + corporate_count
        
        # Create config for cost calculation
        config = {
            'customer_count': total_customers,
            'architecture_variant': architecture,
            'backup_retention_days': 30,
            'log_retention_days': 30  # Reduced for cost optimization
        }
        
        # Calculate metrics with segment-weighted transaction rates
        metrics = calculate_complete_galaxy_metrics(config)
        
        # Adjust metrics based on actual operation volumes
        # Transaction rate based on actual volumes
        total_transactions = totals['services'].get('TITAN', {}).get('write_ops', 0) / (30 * 24 * 3600)
        metrics['transaction_tps'] = total_transactions
        metrics['ledger_tps'] = total_transactions  # Ledger entries match transactions
        metrics['customer_api_tps'] = totals['total_operations_month'] / (30 * 24 * 3600)
        
        # Data volume based on actual calculations
        metrics['total_data_gb'] = totals['total_data_gb_month'] * 12  # Annual data
        metrics['include_nonprod'] = include_nonprod
        
        # Load pricing for provider
        pricing = load_cloud_pricing(provider)
        
        # Calculate costs
        costs = calculate_with_cloud_pricing(metrics, pricing)
        
        # Add segment breakdown
        segment_breakdown = {
            'retail': {
                'count': retail_count,
                'percentage': (retail_count / total_customers) * 100,
                'operations': totals['segments']['retail']['operations'],
                'data_gb': totals['segments']['retail']['data_gb']
            },
            'sme': {
                'count': sme_count,
                'percentage': (sme_count / total_customers) * 100,
                'operations': totals['segments']['sme']['operations'],
                'data_gb': totals['segments']['sme']['data_gb']
            },
            'corporate': {
                'count': corporate_count,
                'percentage': (corporate_count / total_customers) * 100,
                'operations': totals['segments']['corporate']['operations'],
                'data_gb': totals['segments']['corporate']['data_gb']
            }
        }
        
        # Format response
        response = {
            'provider': provider.upper(),
            'totalCustomers': total_customers,
            'segments': segment_breakdown,
            'architecture': architecture,
            'monthlyCost': costs['total_monthly'],
            'annualCost': costs['total_annual'],
            'costPerCustomer': costs['cost_per_customer'],
            'operations': {
                'totalPerMonth': totals['total_operations_month'],
                'writePerMonth': totals['total_write_operations'],
                'readPerMonth': totals['total_read_operations'],
                'dataGbPerMonth': totals['total_data_gb_month'],
                'opsPerSecond': totals['total_operations_month'] / (30 * 24 * 3600)
            },
            'components': {
                'compute': costs['components'].get('compute', 0),
                'database': costs['components'].get('database', 0),
                'storage': costs['components'].get('storage', 0),
                'network': costs['components'].get('network', 0),
                'observability': costs['components'].get('observability', 0),
                'security': costs['components'].get('security', 0),
                'backupDr': costs['components'].get('backup_dr', 0),
                'nonProduction': costs['components'].get('non_production', 0),
                'cacheQueue': costs['components'].get('cache_queue', 0),
                'apiGateway': costs['components'].get('api_gateway', 0),
                'cicd': costs['components'].get('cicd', 0),
            },
            'serviceBreakdown': totals['services']
        }
        
        return jsonify(response)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare-segment', methods=['POST'])
def compare_segment_providers():
    """Compare costs across providers for segment-based configuration"""
    try:
        data = request.json
        
        # Extract parameters
        retail_count = data.get('retail', 1000000)
        sme_count = data.get('sme', 100000)
        corporate_count = data.get('corporate', 10000)
        architecture = data.get('architecture', 'single_region_3az')
        include_nonprod = data.get('includeNonProd', True)
        volume_multiplier = data.get('volumeMultiplier', 1.0)
        
        # Calculate volumes once
        totals = calculate_total_volumes(retail_count, sme_count, corporate_count, volume_multiplier)
        total_customers = retail_count + sme_count + corporate_count
        
        # Create config
        config = {
            'customer_count': total_customers,
            'architecture_variant': architecture,
            'backup_retention_days': 30,
            'log_retention_days': 30
        }
        
        # Calculate metrics
        metrics = calculate_complete_galaxy_metrics(config)
        metrics['include_nonprod'] = include_nonprod
        
        # Adjust metrics for segments
        total_transactions = totals['services'].get('TITAN', {}).get('write_ops', 0) / (30 * 24 * 3600)
        metrics['transaction_tps'] = total_transactions
        metrics['ledger_tps'] = total_transactions
        metrics['customer_api_tps'] = totals['total_operations_month'] / (30 * 24 * 3600)
        metrics['total_data_gb'] = totals['total_data_gb_month'] * 12
        
        # Calculate for each provider
        results = {}
        for provider in ['aws', 'gcp', 'azure']:
            try:
                pricing = load_cloud_pricing(provider)
                costs = calculate_with_cloud_pricing(metrics, pricing)
                
                results[provider] = {
                    'provider': provider.upper(),
                    'monthlyCost': costs['total_monthly'],
                    'annualCost': costs['total_annual'],
                    'costPerCustomer': costs['cost_per_customer'],
                }
            except Exception as e:
                print(f"Error calculating {provider}: {e}")
                continue
        
        # Find cheapest
        if results:
            cheapest = min(results.items(), key=lambda x: x[1]['monthlyCost'])
            response = {
                'providers': results,
                'cheapest': cheapest[0],
                'comparison': []
            }
            
            # Build comparison
            for provider, costs in results.items():
                diff = ((costs['monthlyCost'] / cheapest[1]['monthlyCost']) - 1) * 100 if cheapest[1]['monthlyCost'] > 0 else 0
                response['comparison'].append({
                    'provider': provider.upper(),
                    'monthlyCost': costs['monthlyCost'],
                    'annualCost': costs['annualCost'],
                    'costPerCustomer': costs['costPerCustomer'],
                    'difference': diff
                })
            
            return jsonify(response)
        else:
            return jsonify({'error': 'No results calculated'}), 500
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/volume', methods=['GET'])
def get_volume_config():
    """Get the current volume configuration YAML"""
    try:
        if VOLUME_CONFIG_FILE.exists():
            with open(VOLUME_CONFIG_FILE, 'r') as f:
                config = yaml.safe_load(f)
                return jsonify(config)
        else:
            return jsonify({'error': 'Configuration file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/volume', methods=['POST'])
def update_volume_config():
    """Update the volume configuration YAML"""
    try:
        data = request.json
        
        # Validate that it's a proper configuration
        if 'customer_segments' not in data or 'operations' not in data:
            return jsonify({'error': 'Invalid configuration format'}), 400
        
        # Save configuration
        with open(VOLUME_CONFIG_FILE, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
        
        return jsonify({'message': 'Configuration updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/pricing/<provider>', methods=['GET'])
def get_pricing_config(provider):
    """Get pricing configuration for a specific provider"""
    try:
        if provider not in PRICING_FILES:
            return jsonify({'error': f'Unknown provider: {provider}'}), 400
        
        pricing_file = PRICING_FILES[provider]
        if pricing_file.exists():
            with open(pricing_file, 'r') as f:
                config = yaml.safe_load(f)
                return jsonify(config)
        else:
            return jsonify({'error': f'Pricing file not found for {provider}'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/pricing/<provider>', methods=['POST'])
def update_pricing_config(provider):
    """Update pricing configuration for a specific provider"""
    try:
        if provider not in PRICING_FILES:
            return jsonify({'error': f'Unknown provider: {provider}'}), 400
        
        data = request.json
        pricing_file = PRICING_FILES[provider]
        
        # Save configuration
        with open(pricing_file, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
        
        return jsonify({'message': f'Pricing configuration for {provider} updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Get list of Galaxy services with operation counts"""
    try:
        # Load current configuration
        segments = {'retail': 1000000, 'sme': 100000, 'corporate': 10000}
        if VOLUME_CONFIG_FILE.exists():
            with open(VOLUME_CONFIG_FILE, 'r') as f:
                config = yaml.safe_load(f)
                if 'customer_segments' in config:
                    for seg in segments.keys():
                        if seg in config['customer_segments']:
                            segments[seg] = config['customer_segments'][seg]['count']
        
        # Calculate volumes
        totals = calculate_total_volumes(segments['retail'], segments['sme'], segments['corporate'])
        
        services = [
            {'id': 'proxima', 'name': 'Proxima', 'description': 'Core Banking Ledger',
             'operations': totals['services'].get('PROXIMA', {}).get('operations', 0)},
            {'id': 'titan', 'name': 'Titan', 'description': 'Transaction Processing',
             'operations': totals['services'].get('TITAN', {}).get('operations', 0)},
            {'id': 'orion', 'name': 'Orion', 'description': 'Retail Customer Service',
             'operations': totals['services'].get('ORION', {}).get('operations', 0)},
            {'id': 'quasar', 'name': 'Quasar', 'description': 'Customer Verification',
             'operations': totals['services'].get('QUASAR', {}).get('operations', 0)},
            {'id': 'krypton', 'name': 'Krypton', 'description': 'Collateral Management',
             'operations': totals['services'].get('KRYPTON', {}).get('operations', 0)},
            {'id': 'aster', 'name': 'Aster', 'description': 'Approval Workflows',
             'operations': totals['services'].get('ASTER', {}).get('operations', 0)},
            {'id': 'polaris', 'name': 'Polaris', 'description': 'Configuration Service',
             'operations': totals['services'].get('POLARIS', {}).get('operations', 0)},
            {'id': 'draco', 'name': 'Draco', 'description': 'RBAC Service',
             'operations': totals['services'].get('DRACO', {}).get('operations', 0)},
            {'id': 'nebula', 'name': 'Nebula', 'description': 'Contact Log Service',
             'operations': totals['services'].get('NEBULA', {}).get('operations', 0)},
            {'id': 'aphelion', 'name': 'Aphelion', 'description': 'Analytics Service',
             'operations': totals['services'].get('APHELION', {}).get('operations', 0)},
            {'id': 'pulsar', 'name': 'Pulsar', 'description': 'Webhook Service',
             'operations': totals['services'].get('PULSAR', {}).get('operations', 0)},
            {'id': 'horizon', 'name': 'Horizon', 'description': 'BackOffice Application',
             'operations': totals['services'].get('HORIZON', {}).get('operations', 0)},
        ]
        
        # Sort by operation count
        services.sort(key=lambda x: x['operations'], reverse=True)
        
        return jsonify({
            'services': services,
            'total': len(services),
            'totalOperations': totals['total_operations_month']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Documentation Portal endpoints
@app.route('/api/documentation/open-portal', methods=['POST'])
def open_documentation_portal():
    """Open the local documentation portal in the default browser"""
    try:
        import subprocess
        import platform
        import os
        
        portal_path = '/Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build/portal-index.html'
        
        # Check if file exists
        if not os.path.exists(portal_path):
            return jsonify({'error': 'Documentation portal file not found'}), 404
        
        # Open the file based on the platform
        if platform.system() == 'Darwin':  # macOS
            subprocess.call(['open', portal_path])
        elif platform.system() == 'Windows':
            subprocess.call(['start', portal_path], shell=True)
        else:  # Linux
            subprocess.call(['xdg-open', portal_path])
        
        return jsonify({'message': 'Documentation portal opened successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documentation/status', methods=['GET'])
def get_documentation_status():
    """Get documentation portal status"""
    try:
        summary = get_documentation_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documentation/lint', methods=['POST'])
def run_documentation_lint():
    """Run lint on documentation"""
    try:
        result = run_lint()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/documentation/build', methods=['POST'])
def build_documentation():
    """Build documentation"""
    try:
        result = build_docs()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/documentation/spec/<service_name>', methods=['GET'])
def get_documentation_spec(service_name):
    """Serve OpenAPI specification for a service"""
    from flask import send_file
    import os
    
    # Map service names to their OpenAPI spec files
    galaxy_base = '/Users/mifo/Desktop/Galaxy'
    
    # Try multiple possible locations
    possible_paths = [
        os.path.join(galaxy_base, service_name, 'build', 'openapi-bundle.yaml'),
        os.path.join(galaxy_base, service_name, 'openapi.yaml'),
        os.path.join(galaxy_base, service_name, 'openapi.yml'),
    ]
    
    for spec_path in possible_paths:
        if os.path.exists(spec_path):
            # Add CORS headers for Swagger UI
            response = send_file(spec_path, mimetype='text/yaml')
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
    
    return jsonify({"error": f"OpenAPI spec not found for {service_name}"}), 404

@app.route('/api/documentation/business', methods=['GET'])
def get_business_docs():
    """Get business documentation structure"""
    try:
        docs_base = '/Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs'
        business_docs = []
        
        # Check for different types of business documentation
        doc_types = {
            'governance': os.path.join(docs_base, 'governance-framework'),
            'architecture': os.path.join(docs_base, 'architecture'),
            'user_guides': os.path.join(docs_base, 'user-guides'),
            'processes': os.path.join(docs_base, 'processes'),
        }
        
        for doc_type, path in doc_types.items():
            if os.path.exists(path):
                # Count files and get basic info
                files = []
                for root, dirs, filenames in os.walk(path):
                    for filename in filenames:
                        if filename.endswith(('.md', '.pdf', '.png', '.jpg')):
                            files.append(filename)
                
                business_docs.append({
                    'type': doc_type.replace('_', ' ').title(),
                    'path': path,
                    'file_count': len(files),
                    'available': True
                })
        
        # Add governance framework (we know this exists)
        if os.path.exists(os.path.join(docs_base, 'governance-framework')):
            business_docs.append({
                'type': 'Governance Framework',
                'description': 'COBIT-based governance processes and controls',
                'path': os.path.join(docs_base, 'governance-framework'),
                'available': True,
                'categories': [
                    'Process Definitions',
                    'Control Objectives',
                    'Risk Management',
                    'Compliance Guidelines'
                ]
            })
        
        return jsonify({
            'success': True,
            'documents': business_docs,
            'total_categories': len(business_docs)
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/documentation/view/<service_name>', methods=['GET'])
def view_documentation(service_name):
    """Redirect to the actual Redoc documentation portal"""
    from flask import redirect
    # Redirect to your existing Redoc portal on port 4000
    # The Redocly server serves individual API docs at /apis/{service}
    return redirect(f'http://127.0.0.1:4000/apis/{service_name.lower()}')

@app.route('/api/documentation/redocly', methods=['GET'])
def open_redocly():
    """Redirect to local Redocly documentation portal"""
    from flask import redirect
    # Redirect to your local Redocly preview server on port 4000
    return redirect('http://127.0.0.1:4000')

if __name__ == '__main__':
    print("Starting Galaxy Cost Calculator API v2...")
    print("API available at: http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /api/segments - Get customer segments")
    print("  POST /api/segments - Update customer segments")
    print("  GET  /api/operations - Get operation profiles")
    print("  POST /api/calculate-segment - Calculate segment-based costs")
    print("  POST /api/compare-segment - Compare providers")
    print("  GET  /api/config/volume - Get volume configuration")
    print("  POST /api/config/volume - Update volume configuration")
    print("  GET  /api/config/pricing/<provider> - Get pricing config")
    print("  POST /api/config/pricing/<provider> - Update pricing config")
    print("  GET  /api/services - List Galaxy services")
    print("  GET  /api/health - Health check")
    print("  GET  /api/documentation/status - Documentation portal status")
    print("  POST /api/documentation/lint - Run documentation lint")
    print("  POST /api/documentation/build - Build documentation")
    
    # Check if running in production mode
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    if is_production:
        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        app.run(debug=True, port=5001)