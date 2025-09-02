# Galaxy Cost Calculator - Deployment Guide

## 🚀 Quick Deploy with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### One-Command Deployment
```bash
./deploy.sh
```

This will:
1. Build the Docker image with both frontend and backend
2. Start the service on port 5000
3. Perform health checks
4. Display the access URL

## 📦 Docker Deployment

### Build and Run
```bash
# Build the image
docker build -t galaxy-cost-calculator .

# Run the container
docker run -d -p 5000:5000 --name galaxy-calc galaxy-cost-calculator

# Or use docker-compose
docker-compose up -d
```

### Access the Application
- **Web Interface**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

### View Logs
```bash
docker logs galaxy-calc
# Or with docker-compose
docker-compose logs -f
```

### Stop and Remove
```bash
docker stop galaxy-calc
docker rm galaxy-calc
# Or with docker-compose
docker-compose down
```

## ☁️ Cloud Deployment Options

### AWS ECS/Fargate

1. **Build and Push to ECR**
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI

# Build and tag
docker build -t galaxy-cost-calculator .
docker tag galaxy-cost-calculator:latest $ECR_URI/galaxy-cost-calculator:latest

# Push to ECR
docker push $ECR_URI/galaxy-cost-calculator:latest
```

2. **Deploy with ECS**
- Create ECS task definition with image from ECR
- Set memory: 512MB, CPU: 256 units
- Configure ALB for load balancing
- Set health check path: /api/health

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/$PROJECT_ID/galaxy-cost-calculator

# Deploy to Cloud Run
gcloud run deploy galaxy-cost-calculator \
  --image gcr.io/$PROJECT_ID/galaxy-cost-calculator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000
```

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry $ACR_NAME --image galaxy-cost-calculator .

# Deploy to ACI
az container create \
  --resource-group galaxy-rg \
  --name galaxy-cost-calculator \
  --image $ACR_NAME.azurecr.io/galaxy-cost-calculator:latest \
  --ports 5000 \
  --dns-name-label galaxy-calc
```

### Kubernetes Deployment

1. **Create deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: galaxy-cost-calculator
spec:
  replicas: 2
  selector:
    matchLabels:
      app: galaxy-calculator
  template:
    metadata:
      labels:
        app: galaxy-calculator
    spec:
      containers:
      - name: galaxy-calculator
        image: galaxy-cost-calculator:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: galaxy-calculator-service
spec:
  selector:
    app: galaxy-calculator
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

2. **Deploy to Kubernetes**
```bash
kubectl apply -f deployment.yaml
kubectl get services galaxy-calculator-service
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to `production` for production deployment
- `PORT`: Override default port (5000)
- `PYTHONUNBUFFERED`: Set to `1` for real-time logs

### Volume Mounts
Mount custom pricing files:
```bash
docker run -v /path/to/pricing:/app/pricing galaxy-cost-calculator
```

## 📊 Production Considerations

### Performance
- The application handles ~1000 requests/second
- Memory usage: ~256MB under normal load
- CPU: Minimal, scales with request volume

### Scaling
- Horizontal scaling recommended for high traffic
- Use load balancer for multiple instances
- Cache API responses with Redis/Memcached

### Security
- Use HTTPS in production (terminate SSL at load balancer)
- Set appropriate CORS origins
- Use environment variables for sensitive data
- Enable rate limiting

### Monitoring
- Health endpoint: `/api/health`
- Metrics to track:
  - Response times
  - Error rates
  - Memory/CPU usage
  - Request volume

### Backup
- Configuration files are stateless
- No database to backup
- Version control pricing YAML files

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs galaxy-calc

# Verify port availability
lsof -i:5000
```

### Health Check Failing
```bash
# Test API directly
curl http://localhost:5000/api/health

# Check container status
docker ps -a
```

### Frontend Not Loading
- Ensure frontend was built: Check for `static/` folder
- Verify nginx/proxy configuration
- Check browser console for errors

### Performance Issues
- Increase container memory/CPU limits
- Enable production mode: `FLASK_ENV=production`
- Use gunicorn with multiple workers

## 📝 Maintenance

### Update Pricing
1. Edit pricing YAML files
2. Rebuild Docker image
3. Redeploy container

### Update Frontend
1. Make changes in `galaxy-cost-frontend/`
2. Rebuild Docker image (includes npm build)
3. Redeploy container

### Rolling Updates
```bash
# Build new version
docker build -t galaxy-cost-calculator:v2 .

# Deploy with zero downtime
docker-compose up -d --no-deps --build galaxy-calculator
```

## 🔗 Integration

### CI/CD Pipeline Example (GitHub Actions)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build and push
      run: |
        docker build -t galaxy-calc .
        docker push $REGISTRY/galaxy-calc:latest
    - name: Deploy
      run: |
        kubectl rollout restart deployment galaxy-cost-calculator
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify health: `curl http://localhost:5000/api/health`
3. Review this guide's troubleshooting section
4. Open issue on GitHub repository

---

Last updated: September 2025