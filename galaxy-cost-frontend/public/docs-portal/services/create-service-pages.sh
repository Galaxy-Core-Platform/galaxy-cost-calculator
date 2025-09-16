#!/bin/bash

# Create complete service documentation pages

create_service_page() {
    local service_name=$1
    local service_title=$2
    local service_desc=$3
    local technology=$4
    local port=$5
    local overview=$6
    local features=$7
    local filename="${service_name}.html"
    
    cat > "$filename" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${service_title} - ${service_desc} | Galaxy Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .platform-header {
            text-align: center;
            color: white;
            padding: 40px 20px 20px;
        }
        
        .platform-title {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .platform-subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1400px;
            margin: 40px auto;
            padding: 0 20px;
        }
        
        .service-header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .service-title-section {
            margin-bottom: 25px;
        }
        
        .back-link {
            display: inline-block;
            color: #667eea;
            text-decoration: none;
            font-size: 0.95em;
            margin-bottom: 15px;
            transition: opacity 0.3s ease;
        }
        
        .back-link:hover {
            opacity: 0.7;
        }
        
        .service-title {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .service-subtitle {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 25px;
        }
        
        .service-badges {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .badge {
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .badge.tech {
            background: #667eea;
            color: white;
        }
        
        .badge.port {
            background: #764ba2;
            color: white;
        }
        
        .badge.status {
            background: #4caf50;
            color: white;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .content-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .content-card.full-width {
            grid-column: 1 / -1;
        }
        
        .card-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .feature-list {
            list-style: none;
        }
        
        .feature-list li {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
            color: #555;
            line-height: 1.6;
        }
        
        .feature-list li:last-child {
            border-bottom: none;
        }
        
        .feature-list li:before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        .btn {
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <!-- Platform Header -->
    <div class="platform-header">
        <h1 class="platform-title">Galaxy Platform</h1>
        <p class="platform-subtitle">Documentation Portal</p>
    </div>
    
    <div class="container">
        <div class="service-header">
            <div class="service-title-section">
                <a href="../portal-index.html" class="back-link">← Back to Portal</a>
                <h1 class="service-title">${service_title}</h1>
                <p class="service-subtitle">${service_desc}</p>
            </div>
            <div class="service-badges">
                <span class="badge tech">${technology}</span>
EOF
    
    if [ -n "$port" ]; then
        echo "                <span class=\"badge port\">Port: ${port}</span>" >> "$filename"
    fi
    
    cat >> "$filename" <<EOF
                <span class="badge status">Production Ready</span>
            </div>
        </div>
        
        <div class="content-grid">
            <div class="content-card">
                <h2 class="card-title">🎯 Overview</h2>
                <p style="color: #666; line-height: 1.8;">
                    ${overview}
                </p>
                <div class="button-group">
                    <a href="../index.html#/apis/${service_name}" class="btn btn-primary">View API Docs</a>
                    <a href="https://github.com/Galaxy-Core-Platform/${service_name}" class="btn btn-secondary">View Source</a>
                </div>
            </div>
            
            <div class="content-card">
                <h2 class="card-title">✨ Key Features</h2>
                <ul class="feature-list">
${features}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
EOF
}

# Create service pages

# Titan
create_service_page "titan" "Titan" "Products Factory" "Rust" "5030" \
    "Titan is the product management system for Galaxy Platform, handling the complete lifecycle of banking products including savings accounts, current accounts, term deposits, and loan products. It provides flexible product configuration, versioning, and feature management capabilities." \
    "                    <li>Product Template Management</li>
                    <li>Feature Configuration</li>
                    <li>Interest Rate Management</li>
                    <li>Fee Structure Definition</li>
                    <li>Product Versioning</li>
                    <li>Eligibility Rules Engine</li>
                    <li>Multi-Currency Support</li>"

# Stellar
create_service_page "stellar" "Stellar" "File Management Service" "Python / FastAPI" "5050" \
    "Stellar provides secure file storage and management for Galaxy Platform, handling document uploads, downloads, and metadata management. Built with Python and FastAPI, it supports various file types including KYC documents, statements, and reports with encryption at rest." \
    "                    <li>Secure File Storage</li>
                    <li>Document Encryption</li>
                    <li>Metadata Management</li>
                    <li>File Versioning</li>
                    <li>Access Control</li>
                    <li>Virus Scanning</li>
                    <li>S3 Compatible Storage</li>"

# Nebula
create_service_page "nebula" "Nebula" "Customer Interaction Logging" "Rust" "" \
    "Nebula captures and manages all customer interactions across Galaxy Platform, providing a comprehensive audit trail and analytics capabilities. It tracks API calls, user actions, system events, and generates insights for compliance and customer service." \
    "                    <li>Real-time Event Capture</li>
                    <li>Interaction Analytics</li>
                    <li>Audit Trail Management</li>
                    <li>Compliance Reporting</li>
                    <li>Customer Journey Tracking</li>
                    <li>Performance Metrics</li>
                    <li>Data Retention Policies</li>"

# Quasar
create_service_page "quasar" "Quasar" "Verification Service" "Rust" "" \
    "Quasar handles all verification and validation operations including email verification, SMS OTP, two-factor authentication, and identity verification. It provides a secure and scalable solution for customer authentication and transaction verification." \
    "                    <li>Email Verification</li>
                    <li>SMS OTP Generation</li>
                    <li>Two-Factor Authentication</li>
                    <li>Biometric Integration</li>
                    <li>Identity Verification</li>
                    <li>Device Fingerprinting</li>
                    <li>Risk-Based Authentication</li>"

# Polaris
create_service_page "polaris" "Polaris" "Configuration & Enum Management" "Rust" "" \
    "Polaris serves as the centralized configuration and enumeration management system for Galaxy Platform. It maintains system-wide settings, feature flags, business rules, and provides dynamic configuration updates without service restarts." \
    "                    <li>Dynamic Configuration</li>
                    <li>Feature Flag Management</li>
                    <li>Enum Definitions</li>
                    <li>Business Rule Engine</li>
                    <li>Configuration Versioning</li>
                    <li>Hot Reload Support</li>
                    <li>Multi-Environment Support</li>"

# Aphelion
create_service_page "aphelion" "Aphelion" "Configuration Service" "Rust" "" \
    "Aphelion provides advanced configuration management capabilities for Galaxy Platform, handling environment-specific settings, secrets management, and configuration distribution. It ensures consistent configuration across all services with audit trails and rollback capabilities." \
    "                    <li>Environment Management</li>
                    <li>Secrets Vault Integration</li>
                    <li>Configuration Templates</li>
                    <li>Rollback Capabilities</li>
                    <li>Configuration Audit Trail</li>
                    <li>Encryption at Rest</li>
                    <li>Real-time Updates</li>"

# Krypton
create_service_page "krypton" "Krypton" "Collateral Module" "Rust" "" \
    "Krypton manages collateral for secured lending products within Galaxy Platform. It handles collateral registration, valuation, monitoring, and liquidation processes while ensuring compliance with regulatory requirements and risk management policies." \
    "                    <li>Collateral Registration</li>
                    <li>Valuation Management</li>
                    <li>LTV Monitoring</li>
                    <li>Margin Call Processing</li>
                    <li>Liquidation Workflows</li>
                    <li>Risk Assessment</li>
                    <li>Regulatory Compliance</li>"

# Aster
create_service_page "aster" "Aster" "Approval Engine" "Rust" "" \
    "Aster provides a sophisticated approval workflow engine for Galaxy Platform, managing multi-level approvals, delegation rules, and authorization matrices. It handles transaction approvals, account operations, and administrative actions with full audit capabilities." \
    "                    <li>Multi-Level Approvals</li>
                    <li>Delegation Management</li>
                    <li>Authorization Matrix</li>
                    <li>Workflow Templates</li>
                    <li>Escalation Rules</li>
                    <li>Approval Analytics</li>
                    <li>Audit Trail</li>"

# Draco
create_service_page "draco" "Draco" "RBAC Backend System" "Rust" "" \
    "Draco implements comprehensive role-based access control for Galaxy Platform, managing user permissions, roles, and access policies. It provides fine-grained authorization, dynamic permission evaluation, and integrates with all platform services for consistent security." \
    "                    <li>Role Management</li>
                    <li>Permission Policies</li>
                    <li>Dynamic Authorization</li>
                    <li>Access Control Lists</li>
                    <li>Permission Inheritance</li>
                    <li>Audit Logging</li>
                    <li>API Security</li>"

# Horizon
create_service_page "horizon" "Horizon" "Backoffice UI" "React" "5137" \
    "Horizon is the comprehensive backoffice user interface for Galaxy Platform, providing administrative tools, customer service interfaces, and operational dashboards. Built with React, it offers a modern, responsive interface for managing all aspects of the banking platform." \
    "                    <li>Customer Management UI</li>
                    <li>Transaction Monitoring</li>
                    <li>Product Configuration</li>
                    <li>User Administration</li>
                    <li>Analytics Dashboards</li>
                    <li>Report Generation</li>
                    <li>Real-time Updates</li>"

# Luna
create_service_page "luna" "Luna" "GenAI Assistant Backend" "Python" "5040" \
    "Luna provides AI-powered assistance for Galaxy Platform, offering intelligent customer support, automated document processing, and predictive analytics. Built with Python, it leverages modern ML models to enhance customer experience and operational efficiency." \
    "                    <li>AI-Powered Chat Support</li>
                    <li>Document Intelligence</li>
                    <li>Predictive Analytics</li>
                    <li>Sentiment Analysis</li>
                    <li>Automated Categorization</li>
                    <li>Natural Language Processing</li>
                    <li>ML Model Management</li>"

# Pulsar
create_service_page "pulsar" "Pulsar" "Webhook Module" "Rust" "" \
    "Pulsar manages webhook subscriptions and event delivery for Galaxy Platform, providing reliable event streaming to external systems. It handles webhook registration, payload transformation, delivery guarantees, and retry mechanisms for system integration." \
    "                    <li>Webhook Registration</li>
                    <li>Event Subscription Management</li>
                    <li>Payload Transformation</li>
                    <li>Delivery Guarantees</li>
                    <li>Retry Mechanisms</li>
                    <li>Rate Limiting</li>
                    <li>Event Filtering</li>"

echo "Service pages created successfully!"