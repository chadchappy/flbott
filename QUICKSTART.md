# 🚀 Quick Start Guide - French Laundry Bot

Get the bot running in 5 minutes!

## Prerequisites

- Docker installed and running
- kubectl configured for `us-demo-west` cluster
- Docker Hub access (username: `chadchappy`)

## Step 1: Build Docker Image

```bash
./build-and-push.sh
```

This will:
- Build the Docker image
- Tag it as `chadchappy/flbot:latest`
- Push to Docker Hub

**Note:** You'll need to login to Docker Hub first:
```bash
docker login
# Username: chadchappy
# Password: [your Docker Hub password]
```

## Step 2: Deploy to Kubernetes

```bash
./deploy-to-k8s.sh us-demo-west default
```

This will:
- Set cluster context to `us-demo-west`
- Create the namespace if needed
- Apply the Kubernetes secret (with your Tock credentials)
- Deploy the bot
- Wait for the pod to be ready

## Step 3: Verify Deployment

```bash
# Check pod status
kubectl get pods -l app=french-laundry-bot

# View logs
kubectl logs -f deployment/french-laundry-bot
```

You should see:
```
================================================
French Laundry Reservation Bot - Starting
================================================
✓ Environment variables validated
✓ Tock Email: was-wishes-0k@icloud.com
✓ Headless Mode: true

Cron Schedule:
  - French Laundry Bot: 0 0 1 * * (Midnight on 1st of each month)
================================================
```

## Step 4: Push to GitHub

```bash
./push-to-github.sh
```

This will:
- Initialize git (if needed)
- Add all files
- Commit changes
- Push to https://github.com/chadchappy/flbott

## That's It!

The bot is now running and will automatically attempt to book a reservation on the 1st of every month at midnight Pacific Time.

## Next Steps

- **Monitor logs** on the 1st of each month
- **Complete payment** manually when the bot reaches checkout
- **Read full documentation** in [DEPLOYMENT.md](DEPLOYMENT.md)

## Troubleshooting

### Docker build fails
```bash
# Make sure Docker is running
docker ps

# Try building manually
docker build -t chadchappy/flbot:latest -f Dockerfile .
```

### Kubernetes deployment fails
```bash
# Check cluster context
kubectl config current-context

# Check if secret exists
kubectl get secret flbot-credentials

# View pod events
kubectl describe pod -l app=french-laundry-bot
```

### Can't push to GitHub
```bash
# Make sure you have access to the repo
# You may need to use a personal access token instead of password

# Generate token at: https://github.com/settings/tokens
# Then use it as your password when prompted
```

## Important Dates

The bot will run on:
- **November 1, 2025 at 00:00 PST** → Books for last Friday in December
- **December 1, 2025 at 00:00 PST** → Books for last Friday in January 2026
- And so on...

## Support

- Full documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- Bot details: [FRENCH_LAUNDRY_BOT.md](FRENCH_LAUNDRY_BOT.md)
- GitHub: https://github.com/chadchappy/flbott

**Good luck! 🍷✨**

