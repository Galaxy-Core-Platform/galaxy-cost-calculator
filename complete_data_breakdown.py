#!/usr/bin/env python3
"""
Complete detailed data size calculation for ALL 12 Galaxy services
Based on actual database schema analysis with exact field sizes
"""

def print_table_structure(table_name, columns, total_bytes, index_overhead):
    """Helper function to print table structure"""
    print(f"\n  TABLE: {table_name}")
    print("  " + "-"*76)
    print(f"  {'Column':<30} {'Type':<25} {'Bytes':<10}")
    print("  " + "-"*76)
    for col_name, col_type, col_bytes in columns:
        print(f"  {col_name:<30} {col_type:<25} {col_bytes:<10}")
    print("  " + "-"*76)
    print(f"  {'Base row size:':<30} {'':<25} {total_bytes:<10}")
    print(f"  {'Index overhead:':<30} {'':<25} {index_overhead:<10}")
    print(f"  {'TOTAL PER ROW:':<30} {'':<25} {total_bytes + index_overhead:<10}")

def calculate_all_services_data():
    """Calculate exact data sizes for all 12 Galaxy services"""
    
    print("="*80)
    print("COMPLETE DATA SIZE CALCULATION - ALL 12 GALAXY SERVICES")
    print("Based on Actual Database Schemas with Exact Field Sizes")
    print("="*80)
    
    # ============================================================================
    # 1. PROXIMA - Core Banking Ledger
    # ============================================================================
    print("\n" + "="*80)
    print("1. PROXIMA - Core Banking Ledger Service")
    print("="*80)
    
    proxima_ledger_entries = [
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
        ('reference', 'VARCHAR(100)', 50),
        ('created_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 100),
    ]
    proxima_ledger_total = sum(x[2] for x in proxima_ledger_entries)
    print_table_structure('ledger_entries', proxima_ledger_entries, proxima_ledger_total, 80)
    
    proxima_accounts = [
        ('id', 'UUID', 16),
        ('account_number', 'VARCHAR(20)', 20),
        ('account_type', 'VARCHAR(50)', 30),
        ('customer_id', 'UUID', 16),
        ('currency', 'CHAR(3)', 3),
        ('status', 'VARCHAR(20)', 10),
        ('opened_date', 'DATE', 8),
        ('closed_date', 'DATE', 8),
        ('interest_rate', 'DECIMAL(5,4)', 4),
        ('credit_limit', 'DECIMAL(15,2)', 8),
        ('metadata', 'JSONB', 200),
    ]
    proxima_accounts_total = sum(x[2] for x in proxima_accounts)
    print_table_structure('accounts', proxima_accounts, proxima_accounts_total, 60)
    
    print("\n  VARIABLE DATA PER TRANSACTION:")
    print(f"    • 2 ledger entries: {2 * (proxima_ledger_total + 80)} bytes")
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 1200 ledger entries (600 transactions × 2): {1200 * (proxima_ledger_total + 80)} bytes")
    print(f"    • 2 accounts: {2 * (proxima_accounts_total + 60)} bytes")
    proxima_customer_total = 1200 * (proxima_ledger_total + 80) + 2 * (proxima_accounts_total + 60)
    print(f"    • TOTAL: {proxima_customer_total} bytes = {proxima_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 2. TITAN - Transaction Processing
    # ============================================================================
    print("\n" + "="*80)
    print("2. TITAN - Transaction Processing Service")
    print("="*80)
    
    titan_transactions = [
        ('id', 'UUID', 16),
        ('account_id', 'UUID', 16),
        ('transaction_type', 'VARCHAR(50)', 20),
        ('amount', 'DECIMAL(15,2)', 8),
        ('currency', 'CHAR(3)', 3),
        ('status', 'VARCHAR(20)', 10),
        ('reference', 'VARCHAR(100)', 50),
        ('counterparty_account', 'VARCHAR(50)', 30),
        ('counterparty_name', 'VARCHAR(255)', 100),
        ('created_at', 'TIMESTAMP', 8),
        ('processed_at', 'TIMESTAMP', 8),
        ('settlement_date', 'DATE', 8),
        ('fees', 'DECIMAL(10,2)', 6),
        ('exchange_rate', 'DECIMAL(10,6)', 6),
        ('metadata', 'JSONB', 150),
    ]
    titan_trans_total = sum(x[2] for x in titan_transactions)
    print_table_structure('transactions', titan_transactions, titan_trans_total, 100)
    
    titan_pending = [
        ('id', 'UUID', 16),
        ('transaction_id', 'UUID', 16),
        ('status', 'VARCHAR(50)', 20),
        ('retry_count', 'INTEGER', 4),
        ('next_retry', 'TIMESTAMP', 8),
        ('error_message', 'TEXT', 200),
        ('created_at', 'TIMESTAMP', 8),
    ]
    titan_pending_total = sum(x[2] for x in titan_pending)
    print_table_structure('pending_transactions', titan_pending, titan_pending_total, 40)
    
    print("\n  VARIABLE DATA PER TRANSACTION:")
    print(f"    • 1 transaction record: {titan_trans_total + 100} bytes")
    print(f"    • 1 pending record (10% of transactions): {(titan_pending_total + 40) * 0.1:.0f} bytes")
    print(f"    • TOTAL: {titan_trans_total + 100 + (titan_pending_total + 40) * 0.1:.0f} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 600 transactions: {600 * (titan_trans_total + 100)} bytes")
    print(f"    • 60 pending records: {60 * (titan_pending_total + 40)} bytes")
    titan_customer_total = 600 * (titan_trans_total + 100) + 60 * (titan_pending_total + 40)
    print(f"    • TOTAL: {titan_customer_total} bytes = {titan_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 3. ORION - Retail Customer Service
    # ============================================================================
    print("\n" + "="*80)
    print("3. ORION - Retail Customer Service")
    print("="*80)
    
    orion_customers = [
        ('id', 'UUID', 16),
        ('customer_number', 'VARCHAR(20)', 15),
        ('first_name', 'VARCHAR(100)', 50),
        ('last_name', 'VARCHAR(100)', 50),
        ('middle_name', 'VARCHAR(100)', 30),
        ('email', 'VARCHAR(255)', 60),
        ('phone', 'VARCHAR(50)', 20),
        ('mobile', 'VARCHAR(50)', 20),
        ('date_of_birth', 'DATE', 8),
        ('ssn', 'VARCHAR(20)', 15),
        ('address_line1', 'VARCHAR(255)', 80),
        ('address_line2', 'VARCHAR(255)', 40),
        ('city', 'VARCHAR(100)', 30),
        ('state', 'VARCHAR(50)', 20),
        ('postal_code', 'VARCHAR(20)', 10),
        ('country', 'VARCHAR(100)', 30),
        ('kyc_status', 'VARCHAR(50)', 20),
        ('risk_rating', 'VARCHAR(20)', 10),
        ('segment', 'VARCHAR(50)', 20),
        ('created_at', 'TIMESTAMP', 8),
        ('updated_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 300),
    ]
    orion_cust_total = sum(x[2] for x in orion_customers)
    print_table_structure('retail_customers', orion_customers, orion_cust_total, 150)
    
    orion_preferences = [
        ('customer_id', 'UUID', 16),
        ('communication_channel', 'VARCHAR(50)', 20),
        ('language', 'VARCHAR(10)', 5),
        ('paperless', 'BOOLEAN', 1),
        ('marketing_consent', 'BOOLEAN', 1),
        ('notification_settings', 'JSONB', 200),
        ('updated_at', 'TIMESTAMP', 8),
    ]
    orion_pref_total = sum(x[2] for x in orion_preferences)
    print_table_structure('customer_preferences', orion_preferences, orion_pref_total, 20)
    
    print("\n  VARIABLE DATA PER CUSTOMER UPDATE:")
    print(f"    • Customer record update: {orion_cust_total + 150} bytes")
    print(f"    • Preference update: {orion_pref_total + 20} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 1 customer record: {orion_cust_total + 150} bytes")
    print(f"    • 1 preference record: {orion_pref_total + 20} bytes")
    print(f"    • 20 updates/year: {20 * 100} bytes (audit log)")
    orion_customer_total = (orion_cust_total + 150) + (orion_pref_total + 20) + 2000
    print(f"    • TOTAL: {orion_customer_total} bytes = {orion_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 4. QUASAR - Customer Verification (KYC/AML)
    # ============================================================================
    print("\n" + "="*80)
    print("4. QUASAR - Customer Verification Service (KYC/AML)")
    print("="*80)
    
    quasar_kyc = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('verification_type', 'VARCHAR(50)', 30),
        ('status', 'VARCHAR(50)', 20),
        ('risk_score', 'INTEGER', 4),
        ('risk_factors', 'JSONB', 300),
        ('verified_at', 'TIMESTAMP', 8),
        ('verified_by', 'VARCHAR(100)', 50),
        ('expires_at', 'TIMESTAMP', 8),
        ('document_type', 'VARCHAR(50)', 30),
        ('document_number', 'VARCHAR(100)', 50),
        ('document_country', 'VARCHAR(50)', 20),
        ('verification_method', 'VARCHAR(100)', 40),
        ('metadata', 'JSONB', 200),
    ]
    quasar_kyc_total = sum(x[2] for x in quasar_kyc)
    print_table_structure('kyc_verifications', quasar_kyc, quasar_kyc_total, 100)
    
    quasar_aml = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('check_type', 'VARCHAR(50)', 30),
        ('result', 'VARCHAR(50)', 20),
        ('score', 'INTEGER', 4),
        ('matched_lists', 'TEXT', 200),
        ('pep_status', 'BOOLEAN', 1),
        ('sanctions_status', 'BOOLEAN', 1),
        ('adverse_media', 'BOOLEAN', 1),
        ('checked_at', 'TIMESTAMP', 8),
        ('next_check', 'DATE', 8),
        ('details', 'JSONB', 400),
    ]
    quasar_aml_total = sum(x[2] for x in quasar_aml)
    print_table_structure('aml_checks', quasar_aml, quasar_aml_total, 60)
    
    print("\n  VARIABLE DATA PER KYC/AML CHECK:")
    print(f"    • KYC verification: {quasar_kyc_total + 100} bytes")
    print(f"    • AML check: {quasar_aml_total + 60} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 2 KYC verifications: {2 * (quasar_kyc_total + 100)} bytes")
    print(f"    • 4 AML checks: {4 * (quasar_aml_total + 60)} bytes")
    quasar_customer_total = 2 * (quasar_kyc_total + 100) + 4 * (quasar_aml_total + 60)
    print(f"    • TOTAL: {quasar_customer_total} bytes = {quasar_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 5. KRYPTON - Collateral Management
    # ============================================================================
    print("\n" + "="*80)
    print("5. KRYPTON - Collateral Management Service")
    print("="*80)
    
    krypton_collateral = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('loan_id', 'UUID', 16),
        ('collateral_type', 'VARCHAR(50)', 30),
        ('description', 'TEXT', 200),
        ('valuation_amount', 'DECIMAL(15,2)', 8),
        ('valuation_date', 'DATE', 8),
        ('valuation_method', 'VARCHAR(100)', 50),
        ('ltv_ratio', 'DECIMAL(5,2)', 4),
        ('status', 'VARCHAR(50)', 20),
        ('location', 'VARCHAR(255)', 100),
        ('insurance_status', 'VARCHAR(50)', 20),
        ('insurance_expiry', 'DATE', 8),
        ('created_at', 'TIMESTAMP', 8),
        ('updated_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 300),
    ]
    krypton_coll_total = sum(x[2] for x in krypton_collateral)
    print_table_structure('collateral_assets', krypton_collateral, krypton_coll_total, 80)
    
    krypton_valuations = [
        ('id', 'UUID', 16),
        ('collateral_id', 'UUID', 16),
        ('valuation_date', 'DATE', 8),
        ('market_value', 'DECIMAL(15,2)', 8),
        ('forced_sale_value', 'DECIMAL(15,2)', 8),
        ('appraiser', 'VARCHAR(255)', 100),
        ('notes', 'TEXT', 300),
        ('created_at', 'TIMESTAMP', 8),
    ]
    krypton_val_total = sum(x[2] for x in krypton_valuations)
    print_table_structure('collateral_valuations', krypton_valuations, krypton_val_total, 40)
    
    print("\n  VARIABLE DATA PER COLLATERAL UPDATE:")
    print(f"    • Collateral record: {krypton_coll_total + 80} bytes")
    print(f"    • Valuation update: {krypton_val_total + 40} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR (10% of customers with loans):")
    print(f"    • 1 collateral asset (10% of customers): {(krypton_coll_total + 80) * 0.1:.0f} bytes")
    print(f"    • 2 valuations/year: {2 * (krypton_val_total + 40) * 0.1:.0f} bytes")
    krypton_customer_total = ((krypton_coll_total + 80) + 2 * (krypton_val_total + 40)) * 0.1
    print(f"    • TOTAL (effective): {krypton_customer_total:.0f} bytes = {krypton_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 6. ASTER - Approval Workflow Engine
    # ============================================================================
    print("\n" + "="*80)
    print("6. ASTER - Approval Workflow Engine")
    print("="*80)
    
    aster_workflows = [
        ('id', 'UUID', 16),
        ('workflow_type', 'VARCHAR(100)', 50),
        ('entity_type', 'VARCHAR(50)', 30),
        ('entity_id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('status', 'VARCHAR(50)', 20),
        ('current_step', 'INTEGER', 4),
        ('total_steps', 'INTEGER', 4),
        ('initiated_by', 'VARCHAR(100)', 50),
        ('initiated_at', 'TIMESTAMP', 8),
        ('completed_at', 'TIMESTAMP', 8),
        ('deadline', 'TIMESTAMP', 8),
        ('priority', 'VARCHAR(20)', 10),
        ('metadata', 'JSONB', 400),
    ]
    aster_wf_total = sum(x[2] for x in aster_workflows)
    print_table_structure('workflows', aster_workflows, aster_wf_total, 60)
    
    aster_steps = [
        ('id', 'UUID', 16),
        ('workflow_id', 'UUID', 16),
        ('step_number', 'INTEGER', 4),
        ('step_type', 'VARCHAR(50)', 30),
        ('assignee', 'VARCHAR(100)', 50),
        ('status', 'VARCHAR(50)', 20),
        ('decision', 'VARCHAR(50)', 20),
        ('comments', 'TEXT', 200),
        ('started_at', 'TIMESTAMP', 8),
        ('completed_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 200),
    ]
    aster_step_total = sum(x[2] for x in aster_steps)
    print_table_structure('workflow_steps', aster_steps, aster_step_total, 40)
    
    print("\n  VARIABLE DATA PER WORKFLOW:")
    print(f"    • Workflow record: {aster_wf_total + 60} bytes")
    print(f"    • 3 workflow steps avg: {3 * (aster_step_total + 40)} bytes")
    print(f"    • TOTAL: {aster_wf_total + 60 + 3 * (aster_step_total + 40)} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR (20% need approvals):")
    print(f"    • 2 workflows (20% of customers): {2 * (aster_wf_total + 60) * 0.2:.0f} bytes")
    print(f"    • 6 workflow steps: {6 * (aster_step_total + 40) * 0.2:.0f} bytes")
    aster_customer_total = (2 * (aster_wf_total + 60) + 6 * (aster_step_total + 40)) * 0.2
    print(f"    • TOTAL (effective): {aster_customer_total:.0f} bytes = {aster_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 7. POLARIS - Configuration Service
    # ============================================================================
    print("\n" + "="*80)
    print("7. POLARIS - Configuration Service")
    print("="*80)
    
    polaris_config = [
        ('id', 'UUID', 16),
        ('config_key', 'VARCHAR(255)', 100),
        ('config_value', 'TEXT', 500),
        ('category', 'VARCHAR(100)', 50),
        ('environment', 'VARCHAR(50)', 20),
        ('service', 'VARCHAR(100)', 50),
        ('version', 'INTEGER', 4),
        ('is_active', 'BOOLEAN', 1),
        ('created_at', 'TIMESTAMP', 8),
        ('updated_at', 'TIMESTAMP', 8),
        ('updated_by', 'VARCHAR(100)', 50),
        ('metadata', 'JSONB', 200),
    ]
    polaris_conf_total = sum(x[2] for x in polaris_config)
    print_table_structure('configurations', polaris_config, polaris_conf_total, 60)
    
    print("\n  VARIABLE DATA PER CONFIG CHANGE:")
    print(f"    • Configuration update: {polaris_conf_total + 60} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • NO per-customer data (system-wide configuration)")
    print(f"    • TOTAL: 0 bytes = 0.0 KB")
    
    # ============================================================================
    # 8. DRACO - RBAC Service
    # ============================================================================
    print("\n" + "="*80)
    print("8. DRACO - Role-Based Access Control Service")
    print("="*80)
    
    draco_roles = [
        ('id', 'UUID', 16),
        ('role_name', 'VARCHAR(100)', 50),
        ('description', 'TEXT', 200),
        ('permissions', 'JSONB', 500),
        ('is_active', 'BOOLEAN', 1),
        ('created_at', 'TIMESTAMP', 8),
        ('updated_at', 'TIMESTAMP', 8),
    ]
    draco_role_total = sum(x[2] for x in draco_roles)
    print_table_structure('roles', draco_roles, draco_role_total, 40)
    
    draco_user_roles = [
        ('user_id', 'UUID', 16),
        ('role_id', 'UUID', 16),
        ('assigned_at', 'TIMESTAMP', 8),
        ('assigned_by', 'VARCHAR(100)', 50),
        ('expires_at', 'TIMESTAMP', 8),
    ]
    draco_ur_total = sum(x[2] for x in draco_user_roles)
    print_table_structure('user_roles', draco_user_roles, draco_ur_total, 30)
    
    print("\n  VARIABLE DATA PER ROLE ASSIGNMENT:")
    print(f"    • Role assignment: {draco_ur_total + 30} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • Customer portal access role: {draco_ur_total + 30} bytes")
    print(f"    • TOTAL: {draco_ur_total + 30} bytes = {(draco_ur_total + 30)/1024:.1f} KB")
    
    # ============================================================================
    # 9. NEBULA - Contact Log Service
    # ============================================================================
    print("\n" + "="*80)
    print("9. NEBULA - Contact Log Service")
    print("="*80)
    
    nebula_contacts = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('contact_type', 'VARCHAR(50)', 20),
        ('channel', 'VARCHAR(50)', 20),
        ('subject', 'VARCHAR(255)', 100),
        ('description', 'TEXT', 500),
        ('category', 'VARCHAR(100)', 50),
        ('subcategory', 'VARCHAR(100)', 50),
        ('status', 'VARCHAR(50)', 20),
        ('priority', 'VARCHAR(20)', 10),
        ('assigned_to', 'UUID', 16),
        ('resolved_by', 'UUID', 16),
        ('created_at', 'TIMESTAMP', 8),
        ('resolved_at', 'TIMESTAMP', 8),
        ('resolution_notes', 'TEXT', 200),
        ('satisfaction_score', 'INTEGER', 4),
        ('metadata', 'JSONB', 200),
    ]
    nebula_cont_total = sum(x[2] for x in nebula_contacts)
    print_table_structure('contact_logs', nebula_contacts, nebula_cont_total, 100)
    
    nebula_interactions = [
        ('id', 'UUID', 16),
        ('contact_id', 'UUID', 16),
        ('interaction_type', 'VARCHAR(50)', 20),
        ('notes', 'TEXT', 300),
        ('created_by', 'VARCHAR(100)', 50),
        ('created_at', 'TIMESTAMP', 8),
    ]
    nebula_int_total = sum(x[2] for x in nebula_interactions)
    print_table_structure('contact_interactions', nebula_interactions, nebula_int_total, 30)
    
    print("\n  VARIABLE DATA PER CONTACT:")
    print(f"    • Contact log: {nebula_cont_total + 100} bytes")
    print(f"    • 2 interactions avg: {2 * (nebula_int_total + 30)} bytes")
    print(f"    • TOTAL: {nebula_cont_total + 100 + 2 * (nebula_int_total + 30)} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 20 contacts: {20 * (nebula_cont_total + 100)} bytes")
    print(f"    • 40 interactions: {40 * (nebula_int_total + 30)} bytes")
    nebula_customer_total = 20 * (nebula_cont_total + 100) + 40 * (nebula_int_total + 30)
    print(f"    • TOTAL: {nebula_customer_total} bytes = {nebula_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 10. APHELION - Analytics Service
    # ============================================================================
    print("\n" + "="*80)
    print("10. APHELION - Analytics Service")
    print("="*80)
    
    aphelion_metrics = [
        ('customer_id', 'UUID', 16),
        ('metric_date', 'DATE', 8),
        ('transaction_count', 'INTEGER', 4),
        ('transaction_volume', 'DECIMAL(15,2)', 8),
        ('deposit_balance', 'DECIMAL(15,2)', 8),
        ('loan_balance', 'DECIMAL(15,2)', 8),
        ('avg_daily_balance', 'DECIMAL(15,2)', 8),
        ('risk_score', 'INTEGER', 4),
        ('activity_score', 'INTEGER', 4),
        ('profitability_score', 'DECIMAL(10,2)', 6),
        ('channel_usage', 'JSONB', 100),
        ('product_usage', 'JSONB', 100),
        ('metadata', 'JSONB', 100),
    ]
    aphelion_met_total = sum(x[2] for x in aphelion_metrics)
    print_table_structure('customer_metrics', aphelion_metrics, aphelion_met_total, 60)
    
    aphelion_events = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('event_type', 'VARCHAR(100)', 50),
        ('event_category', 'VARCHAR(100)', 50),
        ('event_value', 'JSONB', 200),
        ('timestamp', 'TIMESTAMP', 8),
        ('session_id', 'UUID', 16),
        ('metadata', 'JSONB', 100),
    ]
    aphelion_evt_total = sum(x[2] for x in aphelion_events)
    print_table_structure('analytics_events', aphelion_events, aphelion_evt_total, 40)
    
    print("\n  VARIABLE DATA PER ANALYTICS EVENT:")
    print(f"    • Analytics event: {aphelion_evt_total + 40} bytes")
    print(f"    • Daily metric: {aphelion_met_total + 60} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 365 daily metrics: {365 * (aphelion_met_total + 60)} bytes")
    print(f"    • 500 analytics events: {500 * (aphelion_evt_total + 40)} bytes")
    aphelion_customer_total = 365 * (aphelion_met_total + 60) + 500 * (aphelion_evt_total + 40)
    print(f"    • TOTAL: {aphelion_customer_total} bytes = {aphelion_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 11. PULSAR - Webhook Service
    # ============================================================================
    print("\n" + "="*80)
    print("11. PULSAR - Webhook Service")
    print("="*80)
    
    pulsar_webhooks = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('event_type', 'VARCHAR(100)', 50),
        ('event_id', 'UUID', 16),
        ('url', 'VARCHAR(500)', 200),
        ('method', 'VARCHAR(10)', 6),
        ('headers', 'JSONB', 200),
        ('payload', 'JSONB', 500),
        ('status', 'VARCHAR(50)', 20),
        ('http_status', 'INTEGER', 4),
        ('response', 'TEXT', 300),
        ('attempts', 'INTEGER', 4),
        ('created_at', 'TIMESTAMP', 8),
        ('sent_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 100),
    ]
    pulsar_hook_total = sum(x[2] for x in pulsar_webhooks)
    print_table_structure('webhook_events', pulsar_webhooks, pulsar_hook_total, 80)
    
    pulsar_subscriptions = [
        ('id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('event_type', 'VARCHAR(100)', 50),
        ('url', 'VARCHAR(500)', 200),
        ('is_active', 'BOOLEAN', 1),
        ('created_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 100),
    ]
    pulsar_sub_total = sum(x[2] for x in pulsar_subscriptions)
    print_table_structure('webhook_subscriptions', pulsar_subscriptions, pulsar_sub_total, 40)
    
    print("\n  VARIABLE DATA PER WEBHOOK:")
    print(f"    • Webhook event: {pulsar_hook_total + 80} bytes")
    print(f"    • Subscription: {pulsar_sub_total + 40} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR (30% use webhooks):")
    print(f"    • 2 subscriptions (30% of customers): {2 * (pulsar_sub_total + 40) * 0.3:.0f} bytes")
    print(f"    • 100 webhook events: {100 * (pulsar_hook_total + 80) * 0.3:.0f} bytes")
    pulsar_customer_total = (2 * (pulsar_sub_total + 40) + 100 * (pulsar_hook_total + 80)) * 0.3
    print(f"    • TOTAL (effective): {pulsar_customer_total:.0f} bytes = {pulsar_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # 12. HORIZON - BackOffice Application
    # ============================================================================
    print("\n" + "="*80)
    print("12. HORIZON - BackOffice Application")
    print("="*80)
    
    horizon_sessions = [
        ('id', 'UUID', 16),
        ('user_id', 'UUID', 16),
        ('customer_context', 'UUID', 16),
        ('session_token', 'VARCHAR(255)', 100),
        ('ip_address', 'VARCHAR(45)', 20),
        ('user_agent', 'VARCHAR(500)', 200),
        ('started_at', 'TIMESTAMP', 8),
        ('last_activity', 'TIMESTAMP', 8),
        ('ended_at', 'TIMESTAMP', 8),
        ('metadata', 'JSONB', 100),
    ]
    horizon_sess_total = sum(x[2] for x in horizon_sessions)
    print_table_structure('backoffice_sessions', horizon_sessions, horizon_sess_total, 40)
    
    horizon_activities = [
        ('id', 'UUID', 16),
        ('session_id', 'UUID', 16),
        ('user_id', 'UUID', 16),
        ('customer_id', 'UUID', 16),
        ('action', 'VARCHAR(100)', 50),
        ('entity_type', 'VARCHAR(50)', 30),
        ('entity_id', 'UUID', 16),
        ('details', 'JSONB', 200),
        ('timestamp', 'TIMESTAMP', 8),
    ]
    horizon_act_total = sum(x[2] for x in horizon_activities)
    print_table_structure('activity_logs', horizon_activities, horizon_act_total, 40)
    
    print("\n  VARIABLE DATA PER BACKOFFICE ACTION:")
    print(f"    • Activity log: {horizon_act_total + 40} bytes")
    
    print("\n  DATA PER CUSTOMER/YEAR:")
    print(f"    • 10 backoffice views/actions: {10 * (horizon_act_total + 40)} bytes")
    horizon_customer_total = 10 * (horizon_act_total + 40)
    print(f"    • TOTAL: {horizon_customer_total} bytes = {horizon_customer_total/1024:.1f} KB")
    
    # ============================================================================
    # GRAND SUMMARY
    # ============================================================================
    print("\n" + "="*80)
    print("GRAND SUMMARY - ALL 12 SERVICES")
    print("="*80)
    
    all_services = [
        ('PROXIMA (Ledger)', proxima_customer_total, 600 * (proxima_ledger_total + 80)),
        ('TITAN (Transactions)', titan_customer_total, titan_trans_total + 100),
        ('ORION (Customer)', orion_customer_total, orion_cust_total + 150),
        ('QUASAR (KYC/AML)', quasar_customer_total, quasar_kyc_total + 100),
        ('KRYPTON (Collateral)', krypton_customer_total, krypton_coll_total + 80),
        ('ASTER (Workflows)', aster_customer_total, aster_wf_total + 60),
        ('POLARIS (Config)', 0, 0),
        ('DRACO (RBAC)', draco_ur_total + 30, draco_ur_total + 30),
        ('NEBULA (Contacts)', nebula_customer_total, nebula_cont_total + 100),
        ('APHELION (Analytics)', aphelion_customer_total, aphelion_evt_total + 40),
        ('PULSAR (Webhooks)', pulsar_customer_total, pulsar_hook_total + 80),
        ('HORIZON (BackOffice)', horizon_customer_total, horizon_act_total + 40),
    ]
    
    print("\nDATA PER CUSTOMER PER YEAR:")
    print("-"*80)
    print(f"{'Service':<25} {'Bytes/Year':<15} {'KB/Year':<12} {'Per Transaction':<15}")
    print("-"*80)
    
    total_bytes = 0
    for service, yearly_bytes, per_trans in all_services:
        total_bytes += yearly_bytes
        print(f"{service:<25} {yearly_bytes:<15.0f} {yearly_bytes/1024:<12.1f} {per_trans:<15.0f}")
    
    print("-"*80)
    print(f"{'TOTAL':<25} {total_bytes:<15.0f} {total_bytes/1024:<12.1f}")
    print(f"{'With 50% overhead':<25} {total_bytes*1.5:<15.0f} {total_bytes*1.5/1024:<12.1f}")
    print("="*80)
    
    print("\nKEY METRICS:")
    print(f"  • Base data per customer/year: {total_bytes/1024:.1f} KB")
    print(f"  • With overhead (indexes, WAL, backups): {total_bytes*1.5/1024:.1f} KB")
    print(f"  • Monthly data growth per customer: {total_bytes*1.5/1024/12:.1f} KB")
    print(f"  • Data per financial transaction: ~{(titan_trans_total + 100 + 2*(proxima_ledger_total + 80)):.0f} bytes")
    print(f"  • Data per customer contact: ~{nebula_cont_total + 100:.0f} bytes")

if __name__ == "__main__":
    calculate_all_services_data()