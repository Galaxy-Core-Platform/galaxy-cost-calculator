#!/bin/bash

# Generate HTML pages for all services

services=(
    "proxima:Core Banking System:Rust:5010:false"
    "horizon:Front-/Backoffice Tool:React:5137:false"
    "titan:Products Factory:Rust:5030:true"
    "stellar:File Management Service:Python:5050:false"
    "aphelion:Centralized Configuration Service:Rust::true"
    "nebula:Multi-tenant customer interaction logging:Rust::true"
    "polaris:Configuration and Enum Management:Rust::true"
    "quasar:Verification Service:Rust::true"
    "aster:Universal operation approval engine:Makefile::true"
    "krypton:Collateral Module:Makefile::true"
    "draco:RBAC Backend System:Rust::false"
    "luna:GenAI Assistant Backend:Python:5040:false"
    "pulsar:Webhook Module:Rust::false"
)

for service_info in "${services[@]}"; do
    IFS=':' read -r name description tech port has_api <<< "$service_info"
    
    # Create basic service page
    cat > "services/${name}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name^} - ${description} | Galaxy Platform</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="../portal-index.html" class="logo">🌌 Galaxy Platform</a>
            <nav class="nav-links">
                <a href="../portal-index.html">Home</a>
                <a href="../portal-index.html#services">Services</a>
                <a href="../index.html">API Docs</a>
            </nav>
        </div>
    </header>
    
    <div class="container">
        <div class="service-header">
            <h1 class="service-title">${name^}</h1>
            <p class="service-subtitle">${description}</p>
            <div class="service-badges">
                <span class="badge tech">${tech}</span>
EOF

    if [ -n "$port" ]; then
        echo "                <span class=\"badge port\">Port: ${port}</span>" >> "services/${name}.html"
    fi
    
    if [ "$has_api" = "true" ]; then
        echo "                <span class=\"badge status\">API Available</span>" >> "services/${name}.html"
    fi
    
    cat >> "services/${name}.html" << EOF
            </div>
        </div>
        
        <div class="content-grid">
            <div class="content-card full-width">
                <h2 class="card-title">Overview</h2>
                <p>${description}</p>
EOF
    
    if [ "$has_api" = "true" ]; then
        echo "                <a href=\"../index.html#/apis/${name}\" class=\"btn btn-primary\">View API Documentation</a>" >> "services/${name}.html"
    fi
    
    cat >> "services/${name}.html" << EOF
            </div>
        </div>
    </div>
</body>
</html>
EOF
    
    echo "Created services/${name}.html"
done

echo "All service pages generated!"