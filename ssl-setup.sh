#!/bin/bash

# SSL/HTTPS setup script for calendar-proxy.expressnext.app
set -e

echo "🔒 Setting up SSL/HTTPS for calendar-proxy.expressnext.app..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt-get update -y
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily for certificate generation
sudo systemctl stop nginx 2>/dev/null || true

# Generate SSL certificate
echo "🔑 Generating SSL certificate..."
sudo certbot certonly --standalone \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d calendar-proxy.expressnext.app

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/calendar-proxy.expressnext.app

# Enable the site
sudo ln -sf /etc/nginx/sites-available/calendar-proxy.expressnext.app /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start/restart nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Setup automatic certificate renewal
echo "🔄 Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

echo "✅ SSL setup complete!"
echo "🌐 Your service is now available at: https://calendar-proxy.expressnext.app"
echo "📋 Certificate will auto-renew. Check with: sudo certbot certificates"