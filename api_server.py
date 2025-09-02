#!/usr/bin/env python3
"""
Flask API server for Galaxy Cost Calculator
Provides REST endpoints for cost calculations
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import yaml
from pathlib import Path
import os

# Import calculation functions
from galaxy_cloud_calculator import (
    load_cloud_pricing,
    calculate_complete_galaxy_metrics,
    calculate_with_cloud_pricing
)

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Enable CORS for React frontend

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

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
    return jsonify({'status': 'healthy', 'service': 'Galaxy Cost Calculator API'})

@app.route('/api/calculate', methods=['POST'])
def calculate_cost():
    """Calculate infrastructure costs"""
    try:
        data = request.json
        
        # Extract parameters
        customer_count = data.get('customerCount', 100000)
        architecture = data.get('architecture', 'single_region_3az')
        provider = data.get('provider', 'gcp')
        include_nonprod = data.get('includeNonProd', True)
        
        # Create config
        config = {
            'customer_count': customer_count,
            'architecture_variant': architecture,
            'backup_retention_days': 30,
            'log_retention_days': 90
        }
        
        # Calculate metrics
        metrics = calculate_complete_galaxy_metrics(config)
        metrics['include_nonprod'] = include_nonprod
        
        # Load pricing for provider
        pricing = load_cloud_pricing(provider)
        
        # Calculate costs
        costs = calculate_with_cloud_pricing(metrics, pricing)
        
        # Format response
        response = {
            'provider': provider.upper(),
            'customerCount': customer_count,
            'architecture': architecture,
            'monthlyCost': costs['total_monthly'],
            'annualCost': costs['total_annual'],
            'costPerCustomer': costs['cost_per_customer'],
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
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare', methods=['POST'])
def compare_providers():
    """Compare costs across all cloud providers"""
    try:
        data = request.json
        
        # Extract parameters
        customer_count = data.get('customerCount', 100000)
        architecture = data.get('architecture', 'single_region_3az')
        include_nonprod = data.get('includeNonProd', True)
        
        # Create config
        config = {
            'customer_count': customer_count,
            'architecture_variant': architecture,
            'backup_retention_days': 30,
            'log_retention_days': 90
        }
        
        # Calculate metrics
        metrics = calculate_complete_galaxy_metrics(config)
        metrics['include_nonprod'] = include_nonprod
        
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['GET'])
def get_services():
    """Get list of Galaxy services"""
    services = [
        {'id': 'proxima', 'name': 'Proxima', 'description': 'Core Banking Ledger'},
        {'id': 'titan', 'name': 'Titan', 'description': 'Transaction Processing'},
        {'id': 'orion', 'name': 'Orion', 'description': 'Retail Customer Service'},
        {'id': 'quasar', 'name': 'Quasar', 'description': 'Customer Verification'},
        {'id': 'krypton', 'name': 'Krypton', 'description': 'Collateral Management'},
        {'id': 'aster', 'name': 'Aster', 'description': 'Approval Workflows'},
        {'id': 'polaris', 'name': 'Polaris', 'description': 'Configuration Service'},
        {'id': 'draco', 'name': 'Draco', 'description': 'RBAC Service'},
        {'id': 'nebula', 'name': 'Nebula', 'description': 'Contact Log Service'},
        {'id': 'aphelion', 'name': 'Aphelion', 'description': 'Analytics Service'},
        {'id': 'pulsar', 'name': 'Pulsar', 'description': 'Webhook Service'},
        {'id': 'horizon', 'name': 'Horizon', 'description': 'BackOffice Application'},
    ]
    return jsonify({'services': services, 'total': len(services)})

if __name__ == '__main__':
    # Check if running in production mode
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    print("Starting Galaxy Cost Calculator API...")
    print(f"Mode: {'Production' if is_production else 'Development'}")
    print("API available at: http://localhost:5000")
    print("Endpoints:")
    print("  POST /api/calculate - Calculate costs")
    print("  POST /api/compare - Compare providers")
    print("  GET /api/services - List Galaxy services")
    print("  GET /api/health - Health check")
    
    if is_production:
        # Production mode - use gunicorn instead
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        # Development mode
        app.run(debug=True, port=5000)