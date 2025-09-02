# Multi-stage build for Galaxy Cost Calculator

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY galaxy-cost-frontend/package*.json ./
RUN npm ci --only=production
COPY galaxy-cost-frontend/ ./
RUN npm run build

# Stage 2: Python API server
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY *.py ./
COPY *.yaml ./
COPY galaxy_config.yaml ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build ./static

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/api/health')" || exit 1

# Run the application
CMD ["python", "api_server.py"]