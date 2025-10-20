# French Laundry Reservation Bot 🍽️

An automated reservation bot for The French Laundry restaurant that runs on Kubernetes. The bot automatically attempts to book a table for 2 on the last Friday of every month when reservations open (1st of each month at midnight Pacific Time).

## 🎯 Features

- **Automated Booking**: Runs on a cron schedule (midnight on the 1st of each month)
- **Smart Date Selection**: Automatically calculates the last Friday of the next month
- **Browser Automation**: Uses Puppeteer to navigate the Tock booking system
- **Kubernetes Native**: Designed to run as a containerized workload
- **Configurable**: Easy configuration via environment variables or Kubernetes secrets

## 📋 Prerequisites

- Docker (for building the container image)
- Kubernetes cluster access
- kubectl configured
- A Tock account at https://www.exploretock.com/
- Payment method added to your Tock account

## 🚀 Quick Start

### 1. Build and Push Container Image

```bash
# Build the Docker image
docker build -t ghcr.io/chadchappy/flbot:latest .

# Push to GitHub Container Registry
docker push ghcr.io/chadchappy/flbot:latest
```

Or use the provided script:

```bash
./build-and-push.sh
```

### 2. Configure Credentials

Edit `k8s-secret.yaml` with your base64-encoded credentials:

```bash
# Encode your credentials
echo -n "your-email@example.com" | base64
echo -n "your-password" | base64
echo -n "+1-555-123-4567" | base64
```

Update the values in `k8s-secret.yaml`.

### 3. Deploy to Kubernetes

```bash
# Deploy to your cluster
./deploy-to-k8s.sh us-demo-west default
```

Or manually:

```bash
kubectl apply -f k8s-secret.yaml -n default
kubectl apply -f k8s-deployment.yaml -n default
```

### 4. Monitor the Bot

```bash
# View logs
kubectl logs -f deployment/french-laundry-bot -n default

# Check pod status
kubectl get pods -l app=french-laundry-bot -n default
```

## 📁 Project Structure

```
flbot/
├── src/
│   ├── jobs/
│   │   ├── frenchLaundryBot.ts    # Main bot logic
│   │   └── index.ts                # Job exports
│   ├── utils/
│   │   └── logger.ts               # Logging utility
│   ├── main.ts                     # Application entry point
│   └── index.ts                    # Type definitions
├── config/
│   └── cron.json                   # Cron schedule configuration
├── Dockerfile                      # Container image definition
├── docker-entrypoint-flbot.sh     # Container entrypoint script
├── supervisord-flbot.conf         # Supervisor configuration
├── k8s-deployment.yaml            # Kubernetes deployment manifest
├── k8s-secret.yaml                # Kubernetes secret (credentials)
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## ⚙️ Configuration

### Environment Variables

- `TOCK_EMAIL`: Your Tock account email
- `TOCK_PASSWORD`: Your Tock account password
- `TOCK_PHONE`: Your phone number (format: +1-555-123-4567)
- `HEADLESS`: Run browser in headless mode (default: true)
- `TZ`: Timezone (default: America/Los_Angeles)

### Cron Schedule

The bot runs on a cron schedule defined in `config/cron.json`:

```json
{
  "name": "frenchLaundryBot",
  "schedule": "0 0 1 * *",
  "params": {}
}
```

Schedule: `0 0 1 * *` = Midnight on the 1st of every month

## 🔧 How It Works

1. **Cron Trigger**: The bot runs at midnight Pacific Time on the 1st of each month
2. **Date Calculation**: Calculates the last Friday of the next month
3. **Browser Automation**: 
   - Navigates to The French Laundry Tock page
   - Searches for available reservations on the target date
   - Selects a table for 2 people
   - Fills in contact information
   - Proceeds to payment page (stops here for manual completion)
4. **Logging**: All actions are logged for monitoring and debugging

## 📝 Important Notes

### Security
- The bot stops at the payment page for security reasons
- You'll need to complete the payment manually
- Store credentials securely using Kubernetes secrets

### Tock Account Setup
- Create an account at https://www.exploretock.com/
- Add a payment method to your account
- Verify your email and phone number

### Competition
- The French Laundry is extremely popular
- Reservations sell out in seconds
- Even with automation, success is not guaranteed

### Terms of Service
- Using bots may violate Tock's Terms of Service
- Use at your own risk
- Consider the ethical implications

## 🐛 Troubleshooting

### Bot Not Running

```bash
# Check pod status
kubectl get pods -l app=french-laundry-bot

# View logs
kubectl logs -f deployment/french-laundry-bot

# Describe pod for events
kubectl describe pod -l app=french-laundry-bot
```

### Testing Locally

Set `HEADLESS=false` in your `.env` file to watch the browser in action:

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# Set HEADLESS=false

# Run locally
npm install
npm run build
npm start
```

### Image Pull Errors

Make sure the image is accessible:

```bash
# For GitHub Container Registry, you may need to authenticate
docker login ghcr.io
```

## 📚 Additional Documentation

- [FRENCH_LAUNDRY_BOT.md](FRENCH_LAUNDRY_BOT.md) - Detailed bot documentation
- [BOT_SUMMARY.md](BOT_SUMMARY.md) - Quick overview
- [QUICKSTART.md](QUICKSTART.md) - Step-by-step guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment details

## 📄 License

This project is for educational purposes only. Use responsibly and at your own risk.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## ⚠️ Disclaimer

This bot is provided as-is with no guarantees. The author is not responsible for:
- Failed reservation attempts
- Account suspensions
- Violations of Terms of Service
- Any other issues arising from use of this software

Use responsibly and ethically.
