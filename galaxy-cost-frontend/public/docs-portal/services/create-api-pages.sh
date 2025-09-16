#!/bin/bash

# Create individual API documentation HTML pages for each service

cd /Users/mifo/Desktop/Galaxy/1-GalaxyPlatform-Docs/docs-portal/build

# Create api-docs directory if it doesn't exist
mkdir -p api-docs

# Function to create API documentation page
create_api_page() {
    local service=$1
    local title=$2
    local yaml_path="../../apis/${service}.yaml"
    
    if [ -f "../apis/${service}.yaml" ]; then
        cat > "api-docs/${service}.html" <<EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf8" />
  <title>${title} - API Documentation | Galaxy Platform</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      padding: 0;
      margin: 0;
    }
    .api-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      text-align: center;
    }
    .api-header h1 {
      margin: 0 0 10px 0;
      font-size: 2em;
    }
    .api-header p {
      margin: 0;
      opacity: 0.9;
    }
    .back-link {
      display: inline-block;
      color: white;
      text-decoration: none;
      margin-bottom: 10px;
      opacity: 0.8;
    }
    .back-link:hover {
      opacity: 1;
    }
  </style>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
</head>
<body>
  <div class="api-header">
    <a href="../services/${service}.html" class="back-link">← Back to ${title} Documentation</a>
    <h1>${title} API</h1>
    <p>OpenAPI Specification</p>
  </div>
  <redoc spec-url="${yaml_path}"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
EOF
        echo "Created API documentation for ${service}"
    else
        echo "No API spec found for ${service}, creating placeholder..."
        cat > "api-docs/${service}.html" <<EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf8" />
  <title>${title} - API Documentation | Galaxy Platform</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 50px auto;
      padding: 40px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 {
      color: #667eea;
      margin-bottom: 20px;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    .back-link {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      margin-bottom: 20px;
    }
    .back-link:hover {
      opacity: 0.7;
    }
    .note {
      background: #f0f4ff;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #667eea;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="../services/${service}.html" class="back-link">← Back to ${title} Documentation</a>
    <h1>${title} API Documentation</h1>
    <p>The API documentation for ${title} is currently being prepared.</p>
    <div class="note">
      <strong>Note:</strong> The OpenAPI specification for this service is in development. 
      Please check back later or refer to the service README for current API information.
    </div>
  </div>
</body>
</html>
EOF
    fi
}

# Create API documentation pages for all services
create_api_page "orion" "Orion"
create_api_page "proxima" "Proxima"
create_api_page "titan" "Titan"
create_api_page "stellar" "Stellar"
create_api_page "nebula" "Nebula"
create_api_page "quasar" "Quasar"
create_api_page "polaris" "Polaris"
create_api_page "aphelion" "Aphelion"
create_api_page "krypton" "Krypton"
create_api_page "aster" "Aster"
create_api_page "draco" "Draco"
create_api_page "horizon" "Horizon"
create_api_page "luna" "Luna"
create_api_page "pulsar" "Pulsar"

echo "All API documentation pages created!"