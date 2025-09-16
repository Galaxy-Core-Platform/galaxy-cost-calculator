#!/bin/bash

# Fix API documentation links in all service HTML files

# Function to update API links in a service file
update_service_file() {
    local file=$1
    local service=$2
    local github_name=$3
    
    # Update the API documentation link to point to the correct OpenAPI spec
    sed -i '' "s|href=\"../index.html#/apis/[^\"]*\"|href=\"../../apis/${service}.yaml\"|g" "$file"
    
    # Update the GitHub link
    sed -i '' "s|href=\"https://github.com/Galaxy-Core-Platform/[^\"]*\"|href=\"https://github.com/Galaxy-Core-Platform/${github_name}\"|g" "$file"
}

cd /Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build/services

# Fix each service file
update_service_file "orion.html" "orion" "galaxy-orion"
update_service_file "proxima.html" "proxima" "galaxy-proxima"  # Note: proxima doesn't have API spec
update_service_file "titan.html" "titan" "galaxy-titan"
update_service_file "stellar.html" "stellar" "galaxy-stellar"  # Note: stellar doesn't have API spec
update_service_file "nebula.html" "nebula" "galaxy-nebula"
update_service_file "quasar.html" "quasar" "galaxy-quasar"
update_service_file "polaris.html" "polaris" "galaxy-polaris"
update_service_file "aphelion.html" "aphelion" "galaxy-aphelion"
update_service_file "krypton.html" "krypton" "galaxy-krypton"
update_service_file "aster.html" "aster" "galaxy-aster"
update_service_file "draco.html" "draco" "galaxy-draco"  # Note: draco doesn't have API spec
update_service_file "horizon.html" "horizon" "galaxy-horizon"  # Note: horizon is a UI
update_service_file "luna.html" "luna" "galaxy-luna"  # Note: luna doesn't have API spec
update_service_file "pulsar.html" "pulsar" "galaxy-pulsar"  # Note: pulsar doesn't have API spec

echo "API links fixed in all service files!"