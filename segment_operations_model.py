#!/usr/bin/env python3
"""
Segment-based operations model for Galaxy Platform
Supports Retail, SME, and Corporate customer segments with different behavior patterns
"""

import yaml
import csv
import json
from typing import Dict, List
from dataclasses import dataclass, asdict

@dataclass
class OperationProfile:
    """Operation profile with volume and data characteristics"""
    service: str
    operation: str
    retail_volume: float  # per customer per month
    sme_volume: float     # per customer per month
    corporate_volume: float  # per customer per month
    bytes_per_operation: int
    is_write_operation: bool  # True if generates data, False for reads
    description: str

def get_operation_profiles() -> List[OperationProfile]:
    """Define all operation profiles for Galaxy services"""
    profiles = [
        # PROXIMA - Core Banking Ledger
        OperationProfile("PROXIMA", "Post Transaction Ledger Entry", 100, 500, 5000, 421, True, 
                        "Double-entry bookkeeping entries"),
        OperationProfile("PROXIMA", "Account Balance Query", 200, 1000, 10000, 0, False,
                        "Real-time balance checks"),
        OperationProfile("PROXIMA", "Statement Generation", 1, 5, 20, 0, False,
                        "Monthly/weekly statements"),
        OperationProfile("PROXIMA", "Account Opening", 0.01, 0.05, 0.2, 383, True,
                        "New account creation"),
        OperationProfile("PROXIMA", "Account Closure", 0.002, 0.01, 0.05, 100, True,
                        "Account termination"),
        
        # TITAN - Transaction Processing
        OperationProfile("TITAN", "Payment Transaction", 50, 200, 2000, 539, True,
                        "Outgoing payments"),
        OperationProfile("TITAN", "Transfer Transaction", 30, 150, 1500, 539, True,
                        "Internal transfers"),
        OperationProfile("TITAN", "Deposit Transaction", 15, 100, 500, 539, True,
                        "Incoming deposits"),
        OperationProfile("TITAN", "Withdrawal Transaction", 5, 50, 200, 539, True,
                        "Cash withdrawals"),
        OperationProfile("TITAN", "Batch Payment Processing", 0, 10, 100, 539, True,
                        "Bulk payment files"),
        OperationProfile("TITAN", "Transaction Status Check", 150, 500, 5000, 0, False,
                        "Status queries"),
        OperationProfile("TITAN", "Transaction Reversal", 0.1, 0.5, 5, 570, True,
                        "Transaction corrections"),
        OperationProfile("TITAN", "Pending Transaction Retry", 5, 20, 200, 312, True,
                        "Failed transaction retries"),
        
        # ORION - Customer Service
        OperationProfile("ORION", "Customer Registration", 0.01, 0.05, 0.02, 1010, True,
                        "New customer onboarding"),
        OperationProfile("ORION", "Profile Update", 0.5, 2, 5, 1010, True,
                        "Customer data changes"),
        OperationProfile("ORION", "Address Change", 0.1, 0.5, 1, 300, True,
                        "Address updates"),
        OperationProfile("ORION", "Contact Details Update", 0.2, 1, 2, 200, True,
                        "Phone/email updates"),
        OperationProfile("ORION", "Preference Update", 0.3, 1, 3, 271, True,
                        "Settings and preferences"),
        OperationProfile("ORION", "Customer Search", 5, 20, 100, 0, False,
                        "Customer lookups"),
        OperationProfile("ORION", "Document Upload", 0.05, 0.5, 2, 500, True,
                        "KYC document uploads"),
        
        # QUASAR - KYC/AML
        OperationProfile("QUASAR", "KYC Verification", 0.02, 0.1, 0.5, 892, True,
                        "Identity verification"),
        OperationProfile("QUASAR", "KYC Renewal", 0.01, 0.05, 0.2, 892, True,
                        "Periodic KYC refresh"),
        OperationProfile("QUASAR", "AML Check", 0.1, 1, 10, 765, True,
                        "Anti-money laundering checks"),
        OperationProfile("QUASAR", "Risk Score Update", 0.5, 2, 10, 150, True,
                        "Risk profile updates"),
        OperationProfile("QUASAR", "Sanctions Screening", 0.1, 1, 10, 765, True,
                        "Sanctions list checks"),
        OperationProfile("QUASAR", "PEP Check", 0.05, 0.5, 5, 400, True,
                        "Politically exposed person checks"),
        OperationProfile("QUASAR", "Enhanced Due Diligence", 0, 0.1, 2, 2000, True,
                        "High-risk customer reviews"),
        
        # KRYPTON - Collateral Management
        OperationProfile("KRYPTON", "Collateral Registration", 0.005, 0.1, 0.5, 892, True,
                        "Asset registration"),
        OperationProfile("KRYPTON", "Collateral Valuation", 0.01, 0.2, 1, 504, True,
                        "Asset valuation updates"),
        OperationProfile("KRYPTON", "Insurance Update", 0.008, 0.1, 0.5, 200, True,
                        "Insurance status updates"),
        OperationProfile("KRYPTON", "LTV Calculation", 0.05, 1, 5, 0, False,
                        "Loan-to-value calculations"),
        
        # ASTER - Approval Workflows
        OperationProfile("ASTER", "Loan Approval Workflow", 0.03, 0.5, 2, 700, True,
                        "Credit approval process"),
        OperationProfile("ASTER", "Limit Increase Workflow", 0.02, 0.3, 1, 700, True,
                        "Credit limit changes"),
        OperationProfile("ASTER", "Account Closure Approval", 0.005, 0.02, 0.1, 700, True,
                        "Account closure approvals"),
        OperationProfile("ASTER", "High Value Transaction Approval", 0.05, 1, 10, 612, True,
                        "Large transaction approvals"),
        OperationProfile("ASTER", "Exception Approval", 0.01, 0.5, 5, 612, True,
                        "Policy exception approvals"),
        OperationProfile("ASTER", "Workflow Step Completion", 0.3, 5, 30, 612, True,
                        "Individual approval steps"),
        
        # NEBULA - Contact Logs
        OperationProfile("NEBULA", "Customer Call Log", 0.8, 2, 5, 1354, True,
                        "Phone call records"),
        OperationProfile("NEBULA", "Email Inquiry", 0.5, 3, 10, 1354, True,
                        "Email communications"),
        OperationProfile("NEBULA", "Chat Session", 0.7, 1, 2, 1354, True,
                        "Chat support logs"),
        OperationProfile("NEBULA", "Complaint Registration", 0.05, 0.2, 0.5, 1354, True,
                        "Formal complaints"),
        OperationProfile("NEBULA", "Follow-up Interaction", 2, 8, 20, 440, True,
                        "Follow-up activities"),
        OperationProfile("NEBULA", "Relationship Manager Note", 0, 5, 20, 500, True,
                        "RM activity notes"),
        
        # APHELION - Analytics
        OperationProfile("APHELION", "Daily Metrics Calculation", 30, 30, 30, 434, True,
                        "Daily aggregated metrics"),
        OperationProfile("APHELION", "Transaction Analytics Event", 100, 500, 5000, 496, True,
                        "Transaction behavior tracking"),
        OperationProfile("APHELION", "Login Event", 50, 100, 200, 200, True,
                        "Authentication tracking"),
        OperationProfile("APHELION", "Click Stream Event", 200, 500, 1000, 150, True,
                        "UI interaction tracking"),
        OperationProfile("APHELION", "Risk Score Calculation", 1, 5, 20, 300, True,
                        "Risk model execution"),
        OperationProfile("APHELION", "Report Generation", 0.1, 1, 10, 0, False,
                        "Analytics reports"),
        OperationProfile("APHELION", "Profitability Analysis", 0, 1, 5, 500, True,
                        "Customer profitability"),
        
        # PULSAR - Webhooks
        OperationProfile("PULSAR", "Transaction Webhook", 30, 150, 1500, 1506, True,
                        "Transaction notifications"),
        OperationProfile("PULSAR", "Account Alert Webhook", 10, 50, 200, 800, True,
                        "Account event alerts"),
        OperationProfile("PULSAR", "Status Update Webhook", 5, 20, 100, 600, True,
                        "Status change notifications"),
        OperationProfile("PULSAR", "Webhook Subscription Create", 0.05, 0.2, 1, 431, True,
                        "New webhook subscriptions"),
        OperationProfile("PULSAR", "Webhook Retry", 1, 5, 50, 500, True,
                        "Failed webhook retries"),
        OperationProfile("PULSAR", "Batch Notification", 0, 1, 10, 5000, True,
                        "Bulk notifications"),
        
        # HORIZON - BackOffice
        OperationProfile("HORIZON", "Customer View", 2, 10, 50, 396, True,
                        "Customer profile views"),
        OperationProfile("HORIZON", "Transaction Search", 1, 5, 20, 396, True,
                        "Transaction queries"),
        OperationProfile("HORIZON", "Report Access", 0.1, 1, 10, 396, True,
                        "Report viewing"),
        OperationProfile("HORIZON", "Bulk Operation", 0.01, 0.1, 1, 1000, True,
                        "Batch operations"),
        OperationProfile("HORIZON", "Export Activity", 0.05, 0.5, 5, 396, True,
                        "Data exports"),
        OperationProfile("HORIZON", "Dashboard View", 5, 20, 100, 0, False,
                        "Dashboard access"),
        
        # POLARIS - Configuration
        OperationProfile("POLARIS", "Config Read", 100, 100, 100, 0, False,
                        "Configuration lookups"),
        OperationProfile("POLARIS", "Config Update", 0.001, 0.005, 0.02, 1067, True,
                        "Configuration changes"),
        OperationProfile("POLARIS", "Feature Flag Toggle", 0.0005, 0.002, 0.01, 200, True,
                        "Feature flag changes"),
        
        # DRACO - RBAC
        OperationProfile("DRACO", "Authentication", 50, 100, 200, 0, False,
                        "User authentication"),
        OperationProfile("DRACO", "Authorization Check", 200, 500, 1000, 0, False,
                        "Permission checks"),
        OperationProfile("DRACO", "Role Assignment", 0.01, 0.05, 0.2, 128, True,
                        "Role changes"),
        OperationProfile("DRACO", "Permission Update", 0.005, 0.02, 0.1, 128, True,
                        "Permission modifications"),
        OperationProfile("DRACO", "Audit Log Entry", 10, 50, 200, 250, True,
                        "Security audit logs"),
    ]
    
    return profiles

def generate_segment_csv(segment: str, customer_count: int, output_file: str, 
                         volume_multiplier: float = 1.0) -> None:
    """Generate CSV file for a specific customer segment"""
    profiles = get_operation_profiles()
    
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['Service', 'Operation', 'Volume_Per_Customer_Month', 
                     'Total_Volume_Month', 'Unit', 'Bytes_Per_Op', 'Total_GB_Month', 'Description']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for profile in profiles:
            # Get volume based on segment
            if segment == 'retail':
                volume_per_customer = profile.retail_volume
            elif segment == 'sme':
                volume_per_customer = profile.sme_volume
            elif segment == 'corporate':
                volume_per_customer = profile.corporate_volume
            else:
                raise ValueError(f"Unknown segment: {segment}")
            
            # Apply volume multiplier for user adjustment
            volume_per_customer *= volume_multiplier
            
            # Calculate totals
            total_volume = volume_per_customer * customer_count
            total_gb = (total_volume * profile.bytes_per_operation) / (1024**3) if profile.is_write_operation else 0
            
            writer.writerow({
                'Service': profile.service,
                'Operation': profile.operation,
                'Volume_Per_Customer_Month': volume_per_customer,
                'Total_Volume_Month': int(total_volume),
                'Unit': 'operations',
                'Bytes_Per_Op': profile.bytes_per_operation if profile.is_write_operation else 0,
                'Total_GB_Month': round(total_gb, 3),
                'Description': profile.description
            })

def generate_volume_config(retail_count: int, sme_count: int, corporate_count: int,
                          output_file: str = 'volume_config.yaml') -> Dict:
    """Generate a YAML configuration file with all volume parameters"""
    profiles = get_operation_profiles()
    
    config = {
        'customer_segments': {
            'retail': {
                'count': retail_count,
                'description': 'Individual retail banking customers',
                'characteristics': {
                    'avg_transactions_month': 100,
                    'avg_contacts_month': 2,
                    'digital_adoption': 'high',
                    'product_complexity': 'low'
                }
            },
            'sme': {
                'count': sme_count,
                'description': 'Small and medium enterprise customers',
                'characteristics': {
                    'avg_transactions_month': 500,
                    'avg_contacts_month': 8,
                    'digital_adoption': 'medium',
                    'product_complexity': 'medium'
                }
            },
            'corporate': {
                'count': corporate_count,
                'description': 'Large corporate customers',
                'characteristics': {
                    'avg_transactions_month': 5000,
                    'avg_contacts_month': 20,
                    'digital_adoption': 'high',
                    'product_complexity': 'high'
                }
            }
        },
        'operations': {}
    }
    
    # Add operation volumes
    for profile in profiles:
        if profile.service not in config['operations']:
            config['operations'][profile.service] = {}
        
        config['operations'][profile.service][profile.operation] = {
            'retail_volume': profile.retail_volume,
            'sme_volume': profile.sme_volume,
            'corporate_volume': profile.corporate_volume,
            'bytes_per_operation': profile.bytes_per_operation,
            'is_write': profile.is_write_operation,
            'description': profile.description
        }
    
    # Save to YAML
    with open(output_file, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    
    return config

def calculate_total_volumes(retail_count: int, sme_count: int, corporate_count: int,
                           volume_multiplier: float = 1.0) -> Dict:
    """Calculate total volumes and data sizes across all segments"""
    profiles = get_operation_profiles()
    
    totals = {
        'total_customers': retail_count + sme_count + corporate_count,
        'segments': {
            'retail': {'count': retail_count, 'operations': 0, 'data_gb': 0},
            'sme': {'count': sme_count, 'operations': 0, 'data_gb': 0},
            'corporate': {'count': corporate_count, 'operations': 0, 'data_gb': 0}
        },
        'services': {},
        'total_operations_month': 0,
        'total_data_gb_month': 0,
        'total_write_operations': 0,
        'total_read_operations': 0
    }
    
    for profile in profiles:
        # Calculate for each segment
        retail_ops = profile.retail_volume * retail_count * volume_multiplier
        sme_ops = profile.sme_volume * sme_count * volume_multiplier
        corp_ops = profile.corporate_volume * corporate_count * volume_multiplier
        
        total_ops = retail_ops + sme_ops + corp_ops
        
        if profile.is_write_operation:
            total_data_gb = (total_ops * profile.bytes_per_operation) / (1024**3)
            totals['total_write_operations'] += total_ops
        else:
            total_data_gb = 0
            totals['total_read_operations'] += total_ops
        
        # Update segment totals
        totals['segments']['retail']['operations'] += retail_ops
        totals['segments']['sme']['operations'] += sme_ops
        totals['segments']['corporate']['operations'] += corp_ops
        
        if profile.is_write_operation:
            totals['segments']['retail']['data_gb'] += (retail_ops * profile.bytes_per_operation) / (1024**3)
            totals['segments']['sme']['data_gb'] += (sme_ops * profile.bytes_per_operation) / (1024**3)
            totals['segments']['corporate']['data_gb'] += (corp_ops * profile.bytes_per_operation) / (1024**3)
        
        # Update service totals
        if profile.service not in totals['services']:
            totals['services'][profile.service] = {
                'operations': 0,
                'data_gb': 0,
                'read_ops': 0,
                'write_ops': 0
            }
        
        totals['services'][profile.service]['operations'] += total_ops
        totals['services'][profile.service]['data_gb'] += total_data_gb
        
        if profile.is_write_operation:
            totals['services'][profile.service]['write_ops'] += total_ops
        else:
            totals['services'][profile.service]['read_ops'] += total_ops
        
        totals['total_operations_month'] += total_ops
        totals['total_data_gb_month'] += total_data_gb
    
    return totals

def print_summary_report(retail_count: int, sme_count: int, corporate_count: int,
                        volume_multiplier: float = 1.0) -> None:
    """Print a summary report of all volumes"""
    totals = calculate_total_volumes(retail_count, sme_count, corporate_count, volume_multiplier)
    
    print("="*80)
    print("GALAXY PLATFORM - OPERATIONS VOLUME SUMMARY")
    print("="*80)
    print(f"\nCUSTOMER SEGMENTS:")
    print(f"  Retail:    {retail_count:>10,} customers")
    print(f"  SME:       {sme_count:>10,} customers")
    print(f"  Corporate: {corporate_count:>10,} customers")
    print(f"  TOTAL:     {totals['total_customers']:>10,} customers")
    
    if volume_multiplier != 1.0:
        print(f"\n  Volume Multiplier Applied: {volume_multiplier}x")
    
    print(f"\nMONTHLY OPERATIONS SUMMARY:")
    print(f"  Total Operations:  {totals['total_operations_month']:>15,.0f}")
    print(f"  Write Operations:  {totals['total_write_operations']:>15,.0f}")
    print(f"  Read Operations:   {totals['total_read_operations']:>15,.0f}")
    print(f"  Total Data Volume: {totals['total_data_gb_month']:>15,.1f} GB")
    
    print(f"\nBY SEGMENT:")
    print(f"  {'Segment':<12} {'Operations/Month':>20} {'Data GB/Month':>15}")
    print("  " + "-"*50)
    for segment, data in totals['segments'].items():
        print(f"  {segment.upper():<12} {data['operations']:>20,.0f} {data['data_gb']:>15,.1f}")
    
    print(f"\nBY SERVICE:")
    print(f"  {'Service':<12} {'Total Ops/Month':>20} {'Write Ops':>15} {'Data GB':>10}")
    print("  " + "-"*60)
    for service, data in sorted(totals['services'].items(), key=lambda x: x[1]['operations'], reverse=True):
        print(f"  {service:<12} {data['operations']:>20,.0f} {data['write_ops']:>15,.0f} {data['data_gb']:>10,.1f}")
    
    print("\nKEY METRICS:")
    print(f"  Operations per second: {totals['total_operations_month'] / (30*24*3600):>10,.1f}")
    print(f"  Data growth per day:    {totals['total_data_gb_month'] / 30:>10,.1f} GB")
    print(f"  Data growth per year:   {totals['total_data_gb_month'] * 12:>10,.1f} GB")
    print("="*80)

def main():
    """Main function to generate all segment files"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate segment-based operation volumes for Galaxy Platform')
    parser.add_argument('--retail', type=int, default=1000000, help='Number of retail customers')
    parser.add_argument('--sme', type=int, default=100000, help='Number of SME customers')
    parser.add_argument('--corporate', type=int, default=10000, help='Number of corporate customers')
    parser.add_argument('--multiplier', type=float, default=1.0, help='Volume multiplier for all operations')
    parser.add_argument('--output-dir', default='.', help='Output directory for CSV files')
    
    args = parser.parse_args()
    
    # Generate configuration file
    print("Generating volume configuration...")
    config = generate_volume_config(args.retail, args.sme, args.corporate,
                                   f"{args.output_dir}/volume_config.yaml")
    
    # Generate CSV files for each segment
    print("\nGenerating CSV files...")
    
    # Retail
    retail_file = f"{args.output_dir}/operations_retail_{args.retail}.csv"
    generate_segment_csv('retail', args.retail, retail_file, args.multiplier)
    print(f"  Created: {retail_file}")
    
    # SME
    sme_file = f"{args.output_dir}/operations_sme_{args.sme}.csv"
    generate_segment_csv('sme', args.sme, sme_file, args.multiplier)
    print(f"  Created: {sme_file}")
    
    # Corporate
    corp_file = f"{args.output_dir}/operations_corporate_{args.corporate}.csv"
    generate_segment_csv('corporate', args.corporate, corp_file, args.multiplier)
    print(f"  Created: {corp_file}")
    
    # Combined file
    combined_file = f"{args.output_dir}/operations_combined_all_segments.csv"
    profiles = get_operation_profiles()
    
    with open(combined_file, 'w', newline='') as csvfile:
        fieldnames = ['Service', 'Operation', 'Retail_Vol', 'SME_Vol', 'Corp_Vol', 
                     'Retail_Total', 'SME_Total', 'Corp_Total', 'Grand_Total',
                     'Bytes_Per_Op', 'Total_GB_Month']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for profile in profiles:
            retail_total = profile.retail_volume * args.retail * args.multiplier
            sme_total = profile.sme_volume * args.sme * args.multiplier
            corp_total = profile.corporate_volume * args.corporate * args.multiplier
            grand_total = retail_total + sme_total + corp_total
            
            total_gb = (grand_total * profile.bytes_per_operation) / (1024**3) if profile.is_write_operation else 0
            
            writer.writerow({
                'Service': profile.service,
                'Operation': profile.operation,
                'Retail_Vol': profile.retail_volume * args.multiplier,
                'SME_Vol': profile.sme_volume * args.multiplier,
                'Corp_Vol': profile.corporate_volume * args.multiplier,
                'Retail_Total': int(retail_total),
                'SME_Total': int(sme_total),
                'Corp_Total': int(corp_total),
                'Grand_Total': int(grand_total),
                'Bytes_Per_Op': profile.bytes_per_operation if profile.is_write_operation else 0,
                'Total_GB_Month': round(total_gb, 3)
            })
    
    print(f"  Created: {combined_file}")
    
    # Print summary
    print("\n")
    print_summary_report(args.retail, args.sme, args.corporate, args.multiplier)
    
    print(f"\nConfiguration saved to: {args.output_dir}/volume_config.yaml")
    print("You can edit this file to adjust individual operation volumes.")

if __name__ == "__main__":
    main()