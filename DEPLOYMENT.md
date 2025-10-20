# French Laundry Bot - Deployment Guide

This guide covers deploying the French Laundry reservation bot to Kubernetes and pushing to GitHub.

## 📋 Prerequisites

- Docker installed and running
- Docker Hub account (or access to `chadchappy` account)
- kubectl configured with access to `us-demo-west` cluster
- Git installed
- GitHub repository access to `https://github.com/chadchappy/flbott`

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Build and push Docker image
./build-and-push.sh

# 2. Deploy to Kubernetes
./deploy-to-k8s.sh us-demo-west default
```

### Option 2: Manual Deployment

Follow the detailed steps below.

---

## 📦 Step 1: Build Docker Image

Build the Docker image locally:

```bash
docker build -t chadchappy/flbot:latest -f Dockerfile .
```

Test the image locally (optional):

```bash
docker run --rm \
  -e TOCK_EMAIL="was-wishes-0k@icloud.com" \
  -e TOCK_PASSWORD="sorcoz-8pAfqa-turnyc" \
  -e TOCK_PHONE="+1-616-836-8741" \
  -e HEADLESS="true" \
  chadchappy/flbot:latest
```

---

## 🐳 Step 2: Push to Docker Hub

Login to Docker Hub:

```bash
docker login
# Username: chadchappy
# Password: [your Docker Hub password]
```

Push the image:

```bash
docker push chadchappy/flbot:latest
```

You can also tag with a version:

```bash
docker tag chadchappy/flbot:latest chadchappy/flbot:v1.0.0
docker push chadchappy/flbot:v1.0.0
```

---

## ☸️ Step 3: Deploy to Kubernetes

### 3.1 Set Cluster Context

```bash
kubectl config use-context us-demo-west
```

Or if using a different cluster:

```bash
kubectl config get-contexts
kubectl config use-context <your-cluster-name>
```

### 3.2 Create Namespace (Optional)

```bash
kubectl create namespace flbot
```

Or use the default namespace.

### 3.3 Apply Kubernetes Secret

The secret has already been configured with your credentials:
- Email: `was-wishes-0k@icloud.com`
- Password: `sorcoz-8pAfqa-turnyc`
- Phone: `+1-616-836-8741`

Apply the secret:

```bash
kubectl apply -f k8s-secret.yaml -n default
```

Verify the secret was created:

```bash
kubectl get secret flbot-credentials -n default
```

### 3.4 Deploy the Application

```bash
kubectl apply -f k8s-deployment.yaml -n default
```

### 3.5 Verify Deployment

Check deployment status:

```bash
kubectl get deployments -n default
kubectl get pods -n default -l app=french-laundry-bot
```

Wait for the pod to be ready:

```bash
kubectl rollout status deployment/french-laundry-bot -n default
```

---

## 📊 Monitoring and Logs

### View Logs

```bash
# Follow logs in real-time
kubectl logs -f deployment/french-laundry-bot -n default

# View last 100 lines
kubectl logs --tail=100 deployment/french-laundry-bot -n default

# View logs from a specific pod
kubectl logs -f <pod-name> -n default
```

### Check Pod Status

```bash
kubectl get pods -n default -l app=french-laundry-bot
kubectl describe pod -n default -l app=french-laundry-bot
```

### Execute Commands in Pod

```bash
# Get a shell in the pod
kubectl exec -it deployment/french-laundry-bot -n default -- /bin/bash

# Check cron schedule
kubectl exec -it deployment/french-laundry-bot -n default -- cat /app/config/cron.json

# View environment variables
kubectl exec -it deployment/french-laundry-bot -n default -- env | grep TOCK
```

---

## 🔄 Updating the Deployment

### Update Code and Redeploy

```bash
# 1. Make your code changes
# 2. Build new image
docker build -t chadchappy/flbot:latest -f Dockerfile .

# 3. Push to Docker Hub
docker push chadchappy/flbot:latest

# 4. Restart deployment to pull new image
kubectl rollout restart deployment/french-laundry-bot -n default

# 5. Watch the rollout
kubectl rollout status deployment/french-laundry-bot -n default
```

### Update Secrets

```bash
# Edit k8s-secret.yaml with new credentials
# Then apply:
kubectl apply -f k8s-secret.yaml -n default

# Restart deployment to pick up new secrets
kubectl rollout restart deployment/french-laundry-bot -n default
```

---

## 🗑️ Cleanup

### Delete Deployment

```bash
kubectl delete -f k8s-deployment.yaml -n default
```

### Delete Secret

```bash
kubectl delete secret flbot-credentials -n default
```

### Delete Everything

```bash
kubectl delete -f k8s-deployment.yaml -n default
kubectl delete -f k8s-secret.yaml -n default
```

---

## 🐙 GitHub Repository Setup

### Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/chadchappy/flbott.git

# Add files
git add .

# Commit
git commit -m "Initial commit: French Laundry reservation bot"

# Push to GitHub
git push -u origin main
```

### Update .gitignore

Make sure sensitive files are not committed:

```bash
cat >> .gitignore << EOF
.env
k8s-secret-generated.yaml
node_modules/
dist/
*.log
.DS_Store
EOF
```

---

## 📅 Cron Schedule

The bot runs on this schedule:

```
0 0 1 * *
```

- **Minute**: 0 (top of the hour)
- **Hour**: 0 (midnight)
- **Day**: 1 (first day of the month)
- **Month**: * (every month)
- **Day of Week**: * (any day)

**Timezone**: America/Los_Angeles (Pacific Time)

### Next Run Dates

The bot will attempt to book on:
- **November 1, 2025 at 00:00 PST** → Books for last Friday in December
- **December 1, 2025 at 00:00 PST** → Books for last Friday in January 2026
- And so on...

---

## 🔧 Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod -n default -l app=french-laundry-bot

# Check logs
kubectl logs -n default -l app=french-laundry-bot
```

### Image Pull Errors

```bash
# Verify image exists
docker pull chadchappy/flbot:latest

# Check imagePullPolicy in k8s-deployment.yaml
```

### Secret Not Found

```bash
# Verify secret exists
kubectl get secret flbot-credentials -n default

# Recreate secret
kubectl delete secret flbot-credentials -n default
kubectl apply -f k8s-secret.yaml -n default
```

### Bot Not Running at Scheduled Time

```bash
# Check if cron is running in the pod
kubectl exec -it deployment/french-laundry-bot -n default -- ps aux | grep cron

# Check supervisor status
kubectl exec -it deployment/french-laundry-bot -n default -- supervisorctl status

# Verify timezone
kubectl exec -it deployment/french-laundry-bot -n default -- date
```

---

## 📝 Configuration

### Change Party Size

Edit `src/jobs/frenchLaundryBot.ts`:

```typescript
partySize: 4,  // Change from 2
```

Rebuild and redeploy.

### Change Target Day

Modify the `getLastFridayOfNextMonth()` function to target a different day.

### Change Preferred Time

Edit the search URL in `attemptBooking()`:

```typescript
time=18:00  // Instead of 19:30
```

---

## 🔐 Security Notes

- ✅ Credentials are stored in Kubernetes secrets (base64 encoded)
- ✅ `.env` file is gitignored
- ✅ Bot runs as non-root user in container
- ⚠️ k8s-secret.yaml contains your actual credentials - DO NOT commit to public repo
- ⚠️ Consider using a secrets management solution like HashiCorp Vault for production

---

## 📞 Support

For issues or questions:
1. Check the logs: `kubectl logs -f deployment/french-laundry-bot -n default`
2. Review the troubleshooting section above
3. Check the main documentation: `FRENCH_LAUNDRY_BOT.md`

---

## ✅ Deployment Checklist

- [ ] Docker image built successfully
- [ ] Image pushed to Docker Hub
- [ ] Kubernetes cluster context set to `us-demo-west`
- [ ] Secret created with Tock credentials
- [ ] Deployment applied to cluster
- [ ] Pod is running and healthy
- [ ] Logs show successful startup
- [ ] Code pushed to GitHub repository
- [ ] .gitignore configured properly
- [ ] Documentation reviewed

---

**You're all set! The bot will run automatically on the 1st of each month at midnight Pacific Time.** 🎉

