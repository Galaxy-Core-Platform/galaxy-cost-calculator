#!/usr/bin/env python3
"""
Realistic data size calculator based on actual Galaxy database schemas
"""

def calculate_realistic_data_sizes(customer_count):
    """Calculate realistic data sizes based on actual database schemas"""
    
    # Based on actual schema analysis:
    
    # ORION - Customer Service
    # retail_customers table: ~2KB per row (with JSONB fields)
    # Average customer has: 1 primary record + audit history
    orion_per_customer = {
        'retail_customers': 2.0,  # KB - main record
        'contracts': 1.5,  # KB - contract data
        'contract_customers': 0.5,  # KB - linking table
        'user_preferences': 0.5,  # KB - preferences
        'audit_history': 5.0,  # KB - change history over time
    }
    orion_total_kb = sum(orion_per_customer.values())  # 9.5 KB per customer
    
    # NEBULA - Contact Logs
    # contact_log table: ~500 bytes per entry
    # Average: 20 contacts per customer per year
    nebula_per_customer = {
        'contact_log': 0.5 * 20,  # KB - 20 contacts/year
        'audit_log': 2.0,  # KB - audit trail
    }
    nebula_total_kb = sum(nebula_per_customer.values())  # 12 KB per customer
    
    # TITAN - Transaction Processing
    # Transactions: ~200 bytes per transaction
    # Average: 50 transactions per customer per month
    titan_per_customer = {
        'transactions': 0.2 * 50 * 12,  # KB - 600 transactions/year
        'balances': 1.0,  # KB - account balances
        'limits': 0.5,  # KB - transaction limits
    }
    titan_total_kb = sum(titan_per_customer.values())  # 121.5 KB per customer
    
    # APHELION - Analytics
    # Aggregated data, not per-customer linear growth
    # Monthly summaries: ~1KB per customer
    aphelion_per_customer = {
        'monthly_summaries': 1.0 * 12,  # KB - 12 months
        'usage_patterns': 2.0,  # KB - behavioral data
        'risk_scores': 0.5,  # KB - risk metrics
    }
    aphelion_total_kb = sum(aphelion_per_customer.values())  # 14.5 KB per customer
    
    # DRACO - RBAC (not customer-dependent)
    # Fixed size for roles/permissions
    draco_fixed_gb = 0.1  # 100 MB total for RBAC data
    
    # POLARIS - Configuration (not customer-dependent)
    # Fixed size for configuration
    polaris_fixed_gb = 0.05  # 50 MB total for config data
    
    # HORIZON - BackOffice (minimal customer data)
    # Mostly operational data
    horizon_per_customer = 0.5  # KB - references only
    
    # Calculate totals in GB
    total_per_customer_kb = (
        orion_total_kb + 
        nebula_total_kb + 
        titan_total_kb + 
        aphelion_total_kb + 
        horizon_per_customer
    )
    
    # Convert to GB
    customer_data_gb = (customer_count * total_per_customer_kb) / (1024 * 1024)
    fixed_data_gb = draco_fixed_gb + polaris_fixed_gb
    
    # Add indexes, WAL, and overhead (typically 50% of data)
    overhead_multiplier = 1.5
    
    total_data_gb = (customer_data_gb + fixed_data_gb) * overhead_multiplier
    
    breakdown = {
        'per_customer_kb': total_per_customer_kb,
        'per_customer_mb': total_per_customer_kb / 1024,
        'customer_data_gb': customer_data_gb,
        'fixed_data_gb': fixed_data_gb,
        'total_data_gb': total_data_gb,
        'breakdown_by_service': {
            'orion': orion_total_kb * customer_count / (1024 * 1024),
            'nebula': nebula_total_kb * customer_count / (1024 * 1024),
            'titan': titan_total_kb * customer_count / (1024 * 1024),
            'aphelion': aphelion_total_kb * customer_count / (1024 * 1024),
            'horizon': horizon_per_customer * customer_count / (1024 * 1024),
            'draco': draco_fixed_gb,
            'polaris': polaris_fixed_gb,
        }
    }
    
    return breakdown

def print_data_analysis(customer_counts=[10000, 100000, 500000, 1000000]):
    """Print data size analysis for different customer counts"""
    
    print("\n" + "="*70)
    print("REALISTIC DATA SIZE ESTIMATION BASED ON ACTUAL SCHEMAS")
    print("="*70)
    
    print("\nPer-Customer Data Breakdown:")
    print("-"*70)
    
    # Show per-customer breakdown
    sample = calculate_realistic_data_sizes(100000)
    print(f"Data per customer: {sample['per_customer_kb']:.1f} KB ({sample['per_customer_mb']:.2f} MB)")
    print("\nBreakdown by service (for 100K customers):")
    for service, gb in sample['breakdown_by_service'].items():
        print(f"  {service:<15} {gb:>10.2f} GB")
    
    print("\n" + "-"*70)
    print("Total Data Scaling:")
    print("-"*70)
    print(f"{'Customers':<15} {'Raw Data (GB)':<15} {'With Overhead (GB)':<20} {'Previous Model (GB)':<20}")
    print("-"*70)
    
    for count in customer_counts:
        result = calculate_realistic_data_sizes(count)
        # Previous model estimate (from galaxy_cost_model.py)
        old_estimate = (count * 1015) / 1024  # Old model: ~1GB per customer
        
        print(f"{count:<15,} {result['customer_data_gb']:>14.2f} {result['total_data_gb']:>19.2f} {old_estimate:>19.2f}")
    
    print("\n" + "="*70)
    print("KEY FINDINGS:")
    print("-"*70)
    print("1. Actual data per customer: ~158 KB (0.15 MB)")
    print("2. Previous model assumed: ~1015 KB (1 MB) per customer")
    print("3. Overestimation factor: 6.4x")
    print("4. Main data volume: Transaction history (Titan) at 76% of customer data")
    print("5. With overhead (indexes, WAL): Total is 1.5x raw data")
    print("="*70)

if __name__ == "__main__":
    print_data_analysis()
    
    # Compare costs
    print("\n" + "="*70)
    print("COST IMPACT ANALYSIS")
    print("="*70)
    
    for customers in [100000, 500000]:
        realistic = calculate_realistic_data_sizes(customers)
        old_gb = (customers * 1015) / 1024  # Old assumption
        
        # Rough cost estimates (simplified)
        storage_cost_per_gb = 0.115  # $/GB/month for database storage
        backup_cost_per_gb = 0.095   # $/GB/month for backups
        
        old_storage_cost = old_gb * storage_cost_per_gb * 30  # 30 day retention
        new_storage_cost = realistic['total_data_gb'] * storage_cost_per_gb * 30
        
        print(f"\n{customers:,} customers:")
        print(f"  Old data estimate: {old_gb:.1f} GB -> ${old_storage_cost:,.2f}/month")
        print(f"  Realistic estimate: {realistic['total_data_gb']:.1f} GB -> ${new_storage_cost:,.2f}/month")
        print(f"  Savings: ${old_storage_cost - new_storage_cost:,.2f}/month ({((1 - new_storage_cost/old_storage_cost) * 100):.1f}% reduction)")