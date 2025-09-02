#!/usr/bin/env python3
"""
Detailed data size calculation per transaction/record for each Galaxy service
Based on actual database schema analysis
"""

def calculate_detailed_data_sizes():
    """Calculate exact data sizes based on database schemas"""
    
    print("="*80)
    print("DETAILED DATA SIZE CALCULATION PER SERVICE")
    print("Based on Actual Galaxy Database Schemas")
    print("="*80)
    
    # ORION - Customer Service (from schema analysis)
    print("\n1. ORION - Customer Service")
    print("-"*80)
    orion_tables = {
        'retail_customers': {
            'columns': [
                ('id', 'UUID', 16),
                ('first_name', 'VARCHAR(100)', 50),  # avg 50 bytes
                ('last_name', 'VARCHAR(100)', 50),
                ('email', 'VARCHAR(255)', 60),
                ('phone', 'VARCHAR(50)', 20),
                ('date_of_birth', 'DATE', 8),
                ('address', 'JSONB', 500),  # structured address data
                ('kyc_status', 'VARCHAR(50)', 20),
                ('created_at', 'TIMESTAMP', 8),
                ('updated_at', 'TIMESTAMP', 8),
                ('metadata', 'JSONB', 200),  # additional fields
            ],
            'total_bytes': 940,
            'indexes_overhead': 200,  # Primary key + indexes
        },
        'contracts': {
            'columns': [
                ('id', 'UUID', 16),
                ('customer_id', 'UUID', 16),
                ('contract_type', 'VARCHAR(50)', 30),
                ('status', 'VARCHAR(50)', 20),
                ('terms', 'JSONB', 800),  # contract terms
                ('created_at', 'TIMESTAMP', 8),
                ('updated_at', 'TIMESTAMP', 8),
            ],
            'total_bytes': 898,
            'indexes_overhead': 100,
        },
        'audit_log': {
            'columns': [
                ('id', 'BIGSERIAL', 8),
                ('entity_id', 'UUID', 16),
                ('entity_type', 'VARCHAR(50)', 30),
                ('action', 'VARCHAR(50)', 30),
                ('old_value', 'JSONB', 200),
                ('new_value', 'JSONB', 200),
                ('user_id', 'UUID', 16),
                ('timestamp', 'TIMESTAMP', 8),
            ],
            'total_bytes': 508,
            'indexes_overhead': 50,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in orion_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
        
    # Per customer calculation
    print("\n  Per Customer Data:")
    print(f"    - 1 customer record: {orion_tables['retail_customers']['total_bytes'] + orion_tables['retail_customers']['indexes_overhead']} bytes")
    print(f"    - 1.5 contracts avg: {int(1.5 * (orion_tables['contracts']['total_bytes'] + orion_tables['contracts']['indexes_overhead']))} bytes")
    print(f"    - 10 audit entries/year: {10 * (orion_tables['audit_log']['total_bytes'] + orion_tables['audit_log']['indexes_overhead'])} bytes")
    orion_total = 1140 + 1497 + 5580
    print(f"    TOTAL: {orion_total} bytes = {orion_total/1024:.1f} KB per customer/year")
    
    # TITAN - Transaction Processing
    print("\n2. TITAN - Transaction Processing")
    print("-"*80)
    titan_tables = {
        'transactions': {
            'columns': [
                ('id', 'UUID', 16),
                ('account_id', 'UUID', 16),
                ('transaction_type', 'VARCHAR(50)', 20),
                ('amount', 'DECIMAL(15,2)', 8),
                ('currency', 'CHAR(3)', 3),
                ('status', 'VARCHAR(20)', 10),
                ('reference', 'VARCHAR(100)', 50),
                ('counterparty', 'VARCHAR(255)', 100),
                ('created_at', 'TIMESTAMP', 8),
                ('processed_at', 'TIMESTAMP', 8),
                ('metadata', 'JSONB', 100),
            ],
            'total_bytes': 333,
            'indexes_overhead': 80,
        },
        'account_balances': {
            'columns': [
                ('account_id', 'UUID', 16),
                ('balance', 'DECIMAL(15,2)', 8),
                ('available_balance', 'DECIMAL(15,2)', 8),
                ('pending', 'DECIMAL(15,2)', 8),
                ('currency', 'CHAR(3)', 3),
                ('last_updated', 'TIMESTAMP', 8),
            ],
            'total_bytes': 51,
            'indexes_overhead': 20,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in titan_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
    
    print("\n  Per Customer Transaction Data:")
    print(f"    - 600 transactions/year: {600 * (titan_tables['transactions']['total_bytes'] + titan_tables['transactions']['indexes_overhead'])} bytes")
    print(f"    - 2 account balances: {2 * (titan_tables['account_balances']['total_bytes'] + titan_tables['account_balances']['indexes_overhead'])} bytes")
    titan_total = 600 * 413 + 2 * 71
    print(f"    TOTAL: {titan_total} bytes = {titan_total/1024:.1f} KB per customer/year")
    
    # NEBULA - Contact Logs
    print("\n3. NEBULA - Contact Log Service")
    print("-"*80)
    nebula_tables = {
        'contact_logs': {
            'columns': [
                ('id', 'UUID', 16),
                ('customer_id', 'UUID', 16),
                ('contact_type', 'VARCHAR(50)', 20),  # call, email, chat
                ('subject', 'VARCHAR(255)', 100),
                ('description', 'TEXT', 500),  # avg 500 bytes
                ('status', 'VARCHAR(50)', 20),
                ('priority', 'VARCHAR(20)', 10),
                ('assigned_to', 'UUID', 16),
                ('created_at', 'TIMESTAMP', 8),
                ('resolved_at', 'TIMESTAMP', 8),
                ('metadata', 'JSONB', 200),
            ],
            'total_bytes': 918,
            'indexes_overhead': 100,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in nebula_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
    
    print("\n  Per Customer Contact Data:")
    print(f"    - 20 contacts/year: {20 * (nebula_tables['contact_logs']['total_bytes'] + nebula_tables['contact_logs']['indexes_overhead'])} bytes")
    nebula_total = 20 * 1018
    print(f"    TOTAL: {nebula_total} bytes = {nebula_total/1024:.1f} KB per customer/year")
    
    # PROXIMA - Core Banking Ledger
    print("\n4. PROXIMA - Core Banking Ledger")
    print("-"*80)
    proxima_tables = {
        'ledger_entries': {
            'columns': [
                ('id', 'BIGSERIAL', 8),
                ('transaction_id', 'UUID', 16),
                ('account_id', 'UUID', 16),
                ('debit', 'DECIMAL(15,2)', 8),
                ('credit', 'DECIMAL(15,2)', 8),
                ('balance', 'DECIMAL(15,2)', 8),
                ('currency', 'CHAR(3)', 3),
                ('posting_date', 'DATE', 8),
                ('value_date', 'DATE', 8),
                ('description', 'VARCHAR(255)', 100),
                ('created_at', 'TIMESTAMP', 8),
            ],
            'total_bytes': 187,
            'indexes_overhead': 60,
        },
        'accounts': {
            'columns': [
                ('id', 'UUID', 16),
                ('account_number', 'VARCHAR(20)', 20),
                ('account_type', 'VARCHAR(50)', 30),
                ('customer_id', 'UUID', 16),
                ('currency', 'CHAR(3)', 3),
                ('status', 'VARCHAR(20)', 10),
                ('opened_date', 'DATE', 8),
                ('metadata', 'JSONB', 200),
            ],
            'total_bytes': 303,
            'indexes_overhead': 50,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in proxima_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
    
    print("\n  Per Customer Ledger Data:")
    print(f"    - 1200 ledger entries/year (2 per transaction): {1200 * (proxima_tables['ledger_entries']['total_bytes'] + proxima_tables['ledger_entries']['indexes_overhead'])} bytes")
    print(f"    - 2 accounts: {2 * (proxima_tables['accounts']['total_bytes'] + proxima_tables['accounts']['indexes_overhead'])} bytes")
    proxima_total = 1200 * 247 + 2 * 353
    print(f"    TOTAL: {proxima_total} bytes = {proxima_total/1024:.1f} KB per customer/year")
    
    # QUASAR - KYC/AML Service
    print("\n5. QUASAR - Customer Verification (KYC/AML)")
    print("-"*80)
    quasar_tables = {
        'kyc_verifications': {
            'columns': [
                ('id', 'UUID', 16),
                ('customer_id', 'UUID', 16),
                ('verification_type', 'VARCHAR(50)', 30),
                ('status', 'VARCHAR(50)', 20),
                ('risk_score', 'INTEGER', 4),
                ('verified_at', 'TIMESTAMP', 8),
                ('expires_at', 'TIMESTAMP', 8),
                ('documents', 'JSONB', 500),  # document references
                ('metadata', 'JSONB', 200),
            ],
            'total_bytes': 786,
            'indexes_overhead': 80,
        },
        'aml_checks': {
            'columns': [
                ('id', 'UUID', 16),
                ('customer_id', 'UUID', 16),
                ('check_type', 'VARCHAR(50)', 30),
                ('result', 'VARCHAR(50)', 20),
                ('score', 'INTEGER', 4),
                ('checked_at', 'TIMESTAMP', 8),
                ('details', 'JSONB', 300),
            ],
            'total_bytes': 394,
            'indexes_overhead': 50,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in quasar_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
    
    print("\n  Per Customer KYC/AML Data:")
    print(f"    - 2 KYC verifications: {2 * (quasar_tables['kyc_verifications']['total_bytes'] + quasar_tables['kyc_verifications']['indexes_overhead'])} bytes")
    print(f"    - 4 AML checks/year: {4 * (quasar_tables['aml_checks']['total_bytes'] + quasar_tables['aml_checks']['indexes_overhead'])} bytes")
    quasar_total = 2 * 866 + 4 * 444
    print(f"    TOTAL: {quasar_total} bytes = {quasar_total/1024:.1f} KB per customer/year")
    
    # APHELION - Analytics
    print("\n6. APHELION - Analytics Service")
    print("-"*80)
    aphelion_tables = {
        'customer_metrics': {
            'columns': [
                ('customer_id', 'UUID', 16),
                ('metric_date', 'DATE', 8),
                ('transaction_count', 'INTEGER', 4),
                ('transaction_volume', 'DECIMAL(15,2)', 8),
                ('avg_balance', 'DECIMAL(15,2)', 8),
                ('risk_score', 'INTEGER', 4),
                ('activity_score', 'INTEGER', 4),
                ('metadata', 'JSONB', 100),
            ],
            'total_bytes': 152,
            'indexes_overhead': 40,
        },
        'aggregated_stats': {
            'columns': [
                ('id', 'BIGSERIAL', 8),
                ('period', 'VARCHAR(20)', 10),
                ('category', 'VARCHAR(50)', 30),
                ('value', 'DECIMAL(15,2)', 8),
                ('count', 'INTEGER', 4),
                ('timestamp', 'TIMESTAMP', 8),
            ],
            'total_bytes': 68,
            'indexes_overhead': 20,
        }
    }
    
    print("Table Structure:")
    for table_name, table_data in aphelion_tables.items():
        total_size = table_data['total_bytes'] + table_data['indexes_overhead']
        print(f"\n  {table_name}:")
        print(f"    Base row size: {table_data['total_bytes']} bytes")
        print(f"    Index overhead: {table_data['indexes_overhead']} bytes")
        print(f"    Total per row: {total_size} bytes")
    
    print("\n  Per Customer Analytics Data:")
    print(f"    - 365 daily metrics: {365 * (aphelion_tables['customer_metrics']['total_bytes'] + aphelion_tables['customer_metrics']['indexes_overhead'])} bytes")
    aphelion_total = 365 * 192
    print(f"    TOTAL: {aphelion_total} bytes = {aphelion_total/1024:.1f} KB per customer/year")
    
    # Other services with minimal per-customer data
    print("\n7. OTHER SERVICES (Fixed or Minimal Per-Customer Data)")
    print("-"*80)
    
    other_services = {
        'KRYPTON (Collateral)': {
            'description': 'Only for customers with loans/collateral',
            'per_customer': '5 KB (10% of customers)',
            'effective': 0.5
        },
        'ASTER (Workflows)': {
            'description': 'Approval workflows, not all customers',
            'per_customer': '2 KB (20% of customers)',
            'effective': 0.4
        },
        'PULSAR (Webhooks)': {
            'description': 'Event notifications',
            'per_customer': '1 KB (webhook events)',
            'effective': 1.0
        },
        'POLARIS (Config)': {
            'description': 'System configuration, not customer data',
            'per_customer': '0 KB (fixed)',
            'effective': 0
        },
        'DRACO (RBAC)': {
            'description': 'Role-based access, not customer data',
            'per_customer': '0 KB (fixed)',
            'effective': 0
        },
        'HORIZON (BackOffice)': {
            'description': 'UI activity logs',
            'per_customer': '0.5 KB (indirect)',
            'effective': 0.5
        }
    }
    
    other_total = 0
    for service, data in other_services.items():
        print(f"\n  {service}:")
        print(f"    {data['description']}")
        print(f"    Per customer: {data['per_customer']}")
        print(f"    Effective: {data['effective']} KB")
        other_total += data['effective']
    
    # SUMMARY
    print("\n" + "="*80)
    print("TOTAL DATA PER CUSTOMER SUMMARY")
    print("="*80)
    
    services_data = [
        ('ORION (Customer)', orion_total/1024),
        ('TITAN (Transactions)', titan_total/1024),
        ('NEBULA (Contacts)', nebula_total/1024),
        ('PROXIMA (Ledger)', proxima_total/1024),
        ('QUASAR (KYC/AML)', quasar_total/1024),
        ('APHELION (Analytics)', aphelion_total/1024),
        ('Others Combined', other_total),
    ]
    
    total_kb = 0
    for service, kb in services_data:
        print(f"  {service:.<30} {kb:>8.1f} KB")
        total_kb += kb
    
    print("-"*80)
    print(f"  {'TOTAL DATA PER CUSTOMER':.<30} {total_kb:>8.1f} KB")
    print(f"  {'With 50% overhead (indexes, WAL, etc)':.<30} {total_kb * 1.5:>8.1f} KB")
    print("="*80)
    
    # Variable vs Fixed
    print("\n" + "="*80)
    print("VARIABLE DATA PER TRANSACTION")
    print("="*80)
    print("\nPer Transaction (Variable Only):")
    print(f"  Transaction Record (TITAN):     {titan_tables['transactions']['total_bytes'] + titan_tables['transactions']['indexes_overhead']} bytes")
    print(f"  Ledger Entries (PROXIMA):       {2 * (proxima_tables['ledger_entries']['total_bytes'] + proxima_tables['ledger_entries']['indexes_overhead'])} bytes (2 entries)")
    print(f"  Total per transaction:          {413 + 2*247} bytes")
    
    print("\nPer Contact (Variable Only):")
    print(f"  Contact Log (NEBULA):           {nebula_tables['contact_logs']['total_bytes'] + nebula_tables['contact_logs']['indexes_overhead']} bytes")
    
    print("\nPer KYC Check (Variable Only):")
    print(f"  KYC Verification (QUASAR):      {quasar_tables['kyc_verifications']['total_bytes'] + quasar_tables['kyc_verifications']['indexes_overhead']} bytes")
    print(f"  AML Check (QUASAR):             {quasar_tables['aml_checks']['total_bytes'] + quasar_tables['aml_checks']['indexes_overhead']} bytes")
    
    print("="*80)

if __name__ == "__main__":
    calculate_detailed_data_sizes()