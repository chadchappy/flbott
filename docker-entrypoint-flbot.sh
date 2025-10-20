#!/bin/bash
set -e

echo "================================================"
echo "French Laundry Reservation Bot - Starting"
echo "================================================"
echo "Time: $(date)"
echo "Timezone: $TZ"
echo "================================================"

# Validate required environment variables
if [ -z "$TOCK_EMAIL" ]; then
    echo "ERROR: TOCK_EMAIL environment variable is not set"
    exit 1
fi

if [ -z "$TOCK_PASSWORD" ]; then
    echo "ERROR: TOCK_PASSWORD environment variable is not set"
    exit 1
fi

echo "✓ Environment variables validated"
echo "✓ Tock Email: $TOCK_EMAIL"
echo "✓ Headless Mode: ${HEADLESS:-true}"

# Create .env file from environment variables
cat > /app/.env << EOF
TOCK_EMAIL=$TOCK_EMAIL
TOCK_PASSWORD=$TOCK_PASSWORD
TOCK_PHONE=${TOCK_PHONE:-}
HEADLESS=${HEADLESS:-true}
EOF

echo "✓ Environment configuration created"

# Display cron schedule
echo ""
echo "Cron Schedule:"
echo "  - French Laundry Bot: 0 0 1 * * (Midnight on 1st of each month)"
echo ""

# Execute the command passed to the container
exec "$@"

