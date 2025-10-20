# French Laundry Reservation Bot - Dockerfile
FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libxss1 \
    libxtst6 \
    cron \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript ts-node

# Copy source code
COPY src ./src
COPY config ./config

# Build TypeScript
RUN npm run build

# Create log directory
RUN mkdir -p /var/log/flbot

# Set up supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord-flbot.conf /etc/supervisor/conf.d/supervisord.conf

# Set timezone to Pacific (for French Laundry timing)
ENV TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create entrypoint script
COPY docker-entrypoint-flbot.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose no ports (this is a cron job container)

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD pgrep -f "node.*main.js" || exit 1

# Run as non-root user for security
RUN useradd -m -s /bin/bash flbot && \
    chown -R flbot:flbot /app /var/log/flbot

USER flbot

# Start supervisor which manages the Node.js cron process
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

