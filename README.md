# Deployment Guide

Panduan lengkap deployment aplikasi **Go Backend + Next.js Frontend + PostgreSQL**.

---

## Persiapan VPS

### System Requirements
- **OS**: Ubuntu 20.04 / 22.04 LTS
- **RAM**: Minimal 2GB (Recommended 4GB)
- **Storage**: Minimal 20GB
- **Network**: Public IP Address

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano ufw net-tools build-essential
```

### 2. Setup Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (PENTING! Jangan lupa)
sudo ufw allow 22/tcp

# Allow aplikasi ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Backend (development)

# Check status
sudo ufw status verbose
```

---

## Instalasi Requirements

### 1. Install Git

```bash
sudo apt install -y git
git --version
```

### 2. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### 3. Install Go

```bash
# Download Go
wget https://golang.org/dl/go1.22.0.linux-amd64.tar.gz

# Extract ke /usr/local
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz

# Setup environment variables
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
echo 'export GOPATH=$HOME/go' >> ~/.profile
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.profile

# Reload profile
source ~/.profile

# Verify installation
go version
```

### 4. Install Node.js & npm

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 5. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

sudo systemctl status nginx
```

---

## Setup Database PostgreSQL

### 1. Setup PostgreSQL User & Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Dalam PostgreSQL shell:
CREATE DATABASE titipanq;
CREATE USER titipanq_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE titipanq TO titipanq_user;
ALTER DATABASE titipanq OWNER TO titipanq_user;

# Exit
\q
```

### 2. Configure PostgreSQL

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Cari dan ubah/modifikasi:
listen_addresses = 'localhost'          
port = 5432                           
```

```bash
# Edit access configuration
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

### 3. Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 4. Test Connection

```bash
# Test connection sebagai titipanq_user
psql -h localhost -U titipanq_user -d titipanq -W

# Jika berhasil, akan masuk ke PostgreSQL shell
```

---

## Setup Backend (Go)

### 1. Prepare Directory Structure

```bash
# Buat directory untuk aplikasi
sudo mkdir -p /titipanq/{backend,frontend,logs}
sudo chown -R $USER:$USER /opt/myapp
cd /opt/myapp
```

### 2. Clone/Upload Backend Code

```bash
# Clone atau upload code backend ke /titipanq/backend
cd /titipanq/backend
```

### 3. Setup Environment File

Buat file `/titipanq/backend/.env`:

```dotenv
# Database Configuration
DB_HOST=localhost
DB_USER=titipanq_user
DB_PASS=your_secure_password_here
DB_NAME=titipanq
DB_PORT=5432

# Backend Configuration
PORT=8000
APP_ENV=production

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_NAME=TitipanQ <no-reply@titipanq.com>
SMTP_AUTH_EMAIL=your-email@gmail.com
SMTP_AUTH_PASSWORD=your-app-password
```

### 4. Build Backend Application

```bash
cd /titipanq/backend

# Download dependencies
go mod download

# Build aplikasi
go build -o myapp-backend
```

### 5. Setup Systemd Service

Buat file `/etc/systemd/system/titipanq-backend.service`:

```ini
[Unit]
Description=titipanq Backend Service
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/titipanq/backend
EnvironmentFile=/titipanq/backend/.env
ExecStart=/titipanq/backend/titipanq-backend
Restart=always
RestartSec=10
StandardOutput=file:/titipanq/logs/backend.log
StandardError=file:/titipanq/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

### 6. Enable Backend Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable myapp-backend

# Start service
sudo systemctl start myapp-backend

# Check status
sudo systemctl status myapp-backend
```

---

## Setup Frontend (Next.js)

### 1. Prepare Frontend Directory

```bash
cd /titipanq/frontend

# Clone atau upload frontend code ke sini
# Struktur:
# /titipanq/frontend/
# ├── package.json
# ├── next.config.js
# └── .env.local
```

### 2. Setup Environment File

Buat file `/titipanq/frontend/.env`:

```dotenv
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ASSETS_URL=http://localhost:8000/assets

# Untuk production dengan domain
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
# NEXT_PUBLIC_ASSETS_URL=https://yourdomain.com/assets
```

### 3. Install Dependencies & Build

```bash
cd /titipanq/frontend

# Install dependencies
npm ci

# Build production
npm run build

# Test build
npm start
```

### 4. Setup Systemd Service

Buat file `/etc/systemd/system/titipanq-frontend.service`:

```ini
[Unit]
Description=titipanq Frontend Service
After=network.target titipanq-backend.service
Requires=titipanq-backend.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/titipanq/frontend
Environment=NODE_ENV=production
ExecStart=npm start
Restart=always
RestartSec=10
StandardOutput=file:/titipanq/logs/frontend.log
StandardError=file:/titipanq/logs/frontend-error.log

[Install]
WantedBy=multi-user.target
```

### 5. Enable Frontend Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable titipanq-frontend

# Start service
sudo systemctl start titipanq-frontend

# Check status
sudo systemctl status titipanq-frontend
```

---

## Setup Nginx Reverse Proxy

### 1. Configure Nginx

Buat file `/etc/nginx/sites-available/titipanq`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend - Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'X-Requested-With,Accept,Content-Type,Origin' always;
    }
    
    # Static files dari backend
    location /assets/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 2. Enable Site & Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/titipanq /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Setup Process Management

### 1. Install PM2 (Alternative to systemd for Node.js)

```bash
sudo npm install -g pm2

# Setup startup script
pm2 startup

# Save current process list
pm2 save
```

### 2. PM2 Configuration

Jika ingin menggunakan PM2 untuk frontend:

```bash
cd /titipanq/frontend

# Start dengan PM2
pm2 start npm --name "titipanq-frontend" -- start

# Save configuration
pm2 save

# Setup startup
pm2 startup
```

---

## Deployment Steps

### 1. Initial Server Setup

```bash
# SSH ke VPS
ssh user@your-vps-ip
```

### 2. Setup Database

```bash
# Setup PostgreSQL user dan database
sudo -u postgres psql
# (Ikuti langkah di section database)
```

### 3. Deploy Application Code

```bash
# Buat directory
sudo mkdir -p /titipanq/{backend,frontend,logs}
sudo chown -R $USER:$USER /titipanq

# Clone code
cd /titipanq/backend
# Upload backend code ke sini

cd /titipanq/frontend  
# Upload frontend code ke sini
```

### 4. Setup Environment Files

```bash
# Backend
nano /titipanq/backend/.env

# Frontend
nano /titipanq/frontend/.env
```

### 5. Build Applications

```bash
# Build backend
cd /titipanq/backend
go mod download
go build -o titipanq-backend

# Build frontend
cd /titipanq/frontend
npm ci
npm run build
```

### 6. Start Services

```bash
# Enable dan start services
sudo systemctl enable titipanq-backend
sudo systemctl enable titipanq-frontend

sudo systemctl start titipanq-backend
sudo systemctl start titipanq-frontend

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 7. Verify Deployment

```bash
# Check service status
sudo systemctl status titipanq-backend
sudo systemctl status titipanq-frontend
sudo systemctl status nginx
```
