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

# Import segment operations model
from segment_operations_model import (
    get_operation_profiles,
    calculate_total_volumes,
    generate_volume_config
)

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
    
    # Check if running in production mode
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    if is_production:
        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        app.run(debug=True, port=5001)