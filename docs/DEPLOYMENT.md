# TrailRoom Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [SSL Configuration](#ssl-configuration)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended) or macOS
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 20GB minimum free space

### Software Requirements
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **MongoDB**: 6.0 or higher
- **Git**: Latest version
- **Docker** (optional): 20.10+ and Docker Compose 2.0+

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/trailroom.git
cd trailroom
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

#### Create Backend .env File
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables)).

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
yarn install  # or npm install
```

#### Create Frontend .env File
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Admin Frontend Setup (Optional)
```bash
cd admin-frontend
yarn install
cp .env.example .env
# Edit .env with backend URL
```

---

## Local Development

### Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Or install locally and start
mongod --dbpath /path/to/data
```

### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`

### Start Frontend
```bash
cd frontend
yarn start  # or npm start
```

Frontend will be available at: `http://localhost:3000`

### Start Admin Frontend (Optional)
```bash
cd admin-frontend
yarn start
```

Admin panel will be available at: `http://localhost:3001`

---

## Production Deployment

### Option 1: Manual Deployment

#### 1. Set Up Production Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3.10 python3-pip nodejs npm mongodb nginx supervisor -y

# Install Yarn
npm install -g yarn
```

#### 2. Clone and Set Up Application
```bash
cd /opt
sudo git clone https://github.com/your-org/trailroom.git
cd trailroom
sudo chown -R $USER:$USER .
```

#### 3. Configure Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Create production .env
cp .env.example .env
nano .env  # Edit with production values
```

#### 4. Build Frontend
```bash
cd frontend
yarn install
yarn build

# Serve built files
sudo cp -r build /var/www/trailroom
```

#### 5. Configure Supervisor for Backend

Create `/etc/supervisor/conf.d/trailroom-backend.conf`:
```ini
[program:trailroom-backend]
command=/opt/trailroom/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=/opt/trailroom/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/trailroom-backend.err.log
stdout_logfile=/var/log/trailroom-backend.out.log
environment=PATH="/opt/trailroom/backend/venv/bin"
```

Start the service:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start trailroom-backend
```

#### 6. Configure Nginx

Create `/etc/nginx/sites-available/trailroom`:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React)
    location / {
        root /var/www/trailroom;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large image uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Max upload size
    client_max_body_size 10M;
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/trailroom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Set Up SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 8. Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Docker Deployment

### 1. Create Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Copy application
COPY . .

# Expose port
EXPOSE 8001

# Run application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 2. Create Dockerfile for Frontend

Create `frontend/Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create docker-compose.yml

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: trailroom-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your_secure_password

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: trailroom-backend
    restart: always
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    env_file:
      - backend/.env
    environment:
      - MONGO_URL=mongodb://admin:your_secure_password@mongodb:27017/

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: trailroom-frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./ssl:/etc/nginx/ssl  # For SSL certificates

volumes:
  mongodb_data:
```

### 4. Deploy with Docker Compose
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend
```

---

## Environment Variables

### Backend (.env)
```env
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your_secret_key_here_min_32_characters

# Database
MONGO_URL=mongodb://localhost:27017/
DATABASE_NAME=trailroom

# JWT
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/v1/auth/google/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
```

---

## Database Setup

### Create MongoDB Database and User
```bash
mongo

# In mongo shell
use admin
db.createUser({
  user: "trailroom",
  pwd: "your_secure_password",
  roles: [{ role: "readWrite", db: "trailroom" }]
})

use trailroom

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ id: 1 }, { unique: true })
db.tryon_jobs.createIndex({ user_id: 1 })
db.tryon_jobs.createIndex({ created_at: -1 })
db.credit_transactions.createIndex({ user_id: 1 })
db.credit_transactions.createIndex({ created_at: -1 })
db.payments.createIndex({ user_id: 1 })
db.payments.createIndex({ razorpay_order_id: 1 }, { unique: true })
```

### Backup MongoDB
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/trailroom" --out=/path/to/backup

# Restore
mongorestore --uri="mongodb://localhost:27017/trailroom" /path/to/backup/trailroom
```

---

## SSL Configuration

### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Manual SSL Certificate
If using custom SSL certificates, place them in:
- Certificate: `/etc/nginx/ssl/cert.pem`
- Private Key: `/etc/nginx/ssl/key.pem`

Update Nginx configuration accordingly.

---

## Monitoring

### Application Logs

#### Backend Logs
```bash
# Supervisor logs
sudo tail -f /var/log/trailroom-backend.out.log
sudo tail -f /var/log/trailroom-backend.err.log

# Docker logs
docker logs -f trailroom-backend
```

#### Frontend Logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

#### Check Service Status
```bash
# Supervisor
sudo supervisorctl status

# Docker
docker-compose ps

# Nginx
sudo systemctl status nginx

# MongoDB
sudo systemctl status mongod
```

#### Resource Usage
```bash
# CPU and Memory
htop

# Disk usage
df -h

# MongoDB stats
mongo --eval "db.stats()"
```

---

## Troubleshooting

### Backend Won't Start

**Issue**: Import errors
```bash
# Reinstall dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

**Issue**: MongoDB connection failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string in .env
# Verify MONGO_URL is correct
```

### Frontend Build Fails

**Issue**: Out of memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" yarn build
```

**Issue**: Missing dependencies
```bash
rm -rf node_modules yarn.lock
yarn install
```

### Payment Integration Issues

**Issue**: Razorpay webhook not working
```bash
# Check webhook URL in Razorpay dashboard
# URL: https://your-domain.com/api/v1/payments/webhook

# Verify webhook secret in .env
# Check firewall allows incoming webhooks
```

### AI Generation Fails

**Issue**: Gemini API errors
```bash
# Verify API key in .env
# Check API quota in Google Cloud Console
# Verify image size < 5MB
```

### Database Issues

**Issue**: Connection refused
```bash
# Start MongoDB
sudo systemctl start mongod

# Check port
sudo netstat -tlnp | grep 27017
```

**Issue**: Slow queries
```bash
# Check indexes
mongo trailroom --eval "db.users.getIndexes()"

# Create missing indexes (see Database Setup)
```

---

## Performance Tuning

### Backend
- Use Gunicorn with multiple workers:
  ```bash
  gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
  ```
- Enable MongoDB connection pooling (already configured)
- Implement caching for frequently accessed data

### Frontend
- Enable Nginx gzip compression
- Set proper cache headers for static assets
- Use CDN for static files

### Database
- Ensure proper indexes are created
- Regular database maintenance
- Monitor slow queries

---

## Security Checklist

- [ ] All environment variables are set
- [ ] SSL certificates are installed and valid
- [ ] Firewall is configured (only ports 80, 443, 22 open)
- [ ] MongoDB authentication is enabled
- [ ] Strong passwords for all services
- [ ] Regular backups are configured
- [ ] Logs are monitored
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set in Nginx

---

## Maintenance

### Regular Tasks
- Daily: Check logs for errors
- Weekly: Review system resources
- Monthly: Update dependencies (security patches)
- Quarterly: Full system backup and restore test

### Update Procedure
```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart trailroom-backend

# Update frontend
cd frontend
yarn install
yarn build
sudo cp -r build /var/www/trailroom

# Restart services
sudo systemctl reload nginx
```

---

**Last Updated**: December 2024
**Version**: 1.0
