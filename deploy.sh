#!/bin/bash

# EC2 deployment script for calendar-backend
set -e

echo "🚀 Starting deployment..."

# Update system packages
sudo apt-get update -y

# Install Node.js 18 if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your production settings!"
fi

# Stop existing PM2 process if running
pm2 stop calendar-backend 2>/dev/null || true
pm2 delete calendar-backend 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "✅ Deployment complete!"
echo "📊 Check status with: pm2 status"
echo "📄 View logs with: pm2 logs calendar-backend"