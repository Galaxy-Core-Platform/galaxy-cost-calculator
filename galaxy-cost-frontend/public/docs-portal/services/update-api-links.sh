#!/bin/bash

# Update all service HTML files to point to the new API documentation pages

cd /Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build/services

# Function to update API link in service file
update_api_link() {
    local file=$1
    local service=$2
    
    # Update the API documentation link to point to the new HTML page
    sed -i '' "s|href=\"../../apis/${service}.yaml\"|href=\"../api-docs/${service}.html\"|g" "$file"
}

# Update each service file
update_api_link "orion.html" "orion"
update_api_link "proxima.html" "proxima"
update_api_link "titan.html" "titan"
update_api_link "stellar.html" "stellar"
update_api_link "nebula.html" "nebula"
update_api_link "quasar.html" "quasar"
update_api_link "polaris.html" "polaris"
update_api_link "aphelion.html" "aphelion"
update_api_link "krypton.html" "krypton"
update_api_link "aster.html" "aster"
update_api_link "draco.html" "draco"
update_api_link "horizon.html" "horizon"
update_api_link "luna.html" "luna"
update_api_link "pulsar.html" "pulsar"

echo "All API links updated to point to HTML documentation!"