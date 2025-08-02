# EC2 Deployment Guide

## Quick Deploy

1. **SSH into EC2 and clone repository**:
   ```bash
   ssh ec2-user@your-ec2-ip
   git clone https://github.com/tomr1233/calendar-backend.git
   cd calendar-backend
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## Updates
To update the deployment:
```bash
git pull origin main
pm2 restart calendar-backend
```

## Manual Setup

### Prerequisites
- EC2 instance running Amazon Linux 2 or Ubuntu
- Security group allowing inbound traffic on port 3002
- Node.js 18+ installed

### Environment Configuration
1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your production settings:
   ```bash
   ALLOWED_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
   ```

### Start with PM2
```bash
npm install
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Docker Deployment (Alternative)

```bash
# Build image
docker build -t calendar-backend .

# Run container
docker run -d -p 3002:3002 --name calendar-backend calendar-backend
```

## Health Check
After deployment, verify the service:
```bash
curl http://your-ec2-ip:3002/api/health
```

## Security Notes
- Configure security group to only allow necessary ports
- Set proper CORS origins in production
- Consider using SSL/TLS with a reverse proxy (nginx)
- Regular security updates