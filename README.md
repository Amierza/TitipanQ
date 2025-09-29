# 🚀 Complete Deployment Guide

Panduan lengkap deployment aplikasi **Go Backend + Next.js Frontend + PostgreSQL** menggunakan Docker di VPS.

---

## 📋 Daftar Isi

- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Persiapan VPS](#-persiapan-vps)
- [Instalasi Requirements](#-instalasi-requirements)
- [Struktur Project](#-struktur-project)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Docker Configuration](#-docker-configuration)
- [Deployment Steps](#-deployment-steps)
- [Management & Monitoring](#-management--monitoring)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Arsitektur Aplikasi

```
┌──────────────┐
│   Frontend   │ (Next.js - Port 3000)
│   Container  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │ (Golang - Port 8000)
│   Container  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │ (Database - Port 5432)
│   Container  │
└──────────────┘
```

---

## 🖥 Persiapan VPS

### System Requirements
- **OS**: Ubuntu 20.04 / 22.04 LTS
- **RAM**: Minimal 2GB (Recommended 4GB)
- **Storage**: Minimal 20GB
- **Network**: Public IP Address

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Basic Tools

```bash
sudo apt install -y curl wget git nano ufw net-tools
```

### 3. Setup Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (PENTING! Jangan lupa)
sudo ufw allow 22/tcp

# Allow aplikasi ports
sudo ufw allow 8888/tcp    # Backend
sudo ufw allow 8080/tcp    # Frontend
sudo ufw allow 5432/tcp    # PostgreSQL (optional, untuk akses eksternal)

# Check status
sudo ufw status verbose
```

### 4. Setup Swap (Optional tapi Recommended)

```bash
# Buat swap 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
sudo swapon --show
free -h
```

---

## 📦 Instalasi Requirements

### 1. Install Git

```bash
sudo apt install -y git

# Verify
git --version
```

### 2. Install Docker

```bash
# Remove old versions (jika ada)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Setup Docker repository
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Setup repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 3. Configure Docker (Optional)

```bash
# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

---

## 📂 Struktur Project

```
project-root/
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── go.mod
│   ├── go.sum
│   └── main.go
│
├── frontend/
│   ├── Dockerfile
│   ├── .env.local.example
│   ├── package.json
│   ├── next.config.js
│   └── ...
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Konfigurasi Environment

### Backend Environment (`.env`)

Buat file `backend/.env.example`:

```dotenv
# Database Configuration
DB_HOST=db
DB_USER=postgres
DB_PASS=your_secure_password_here
DB_NAME=titipanq
DB_PORT=5432

# Backend Configuration
PORT=8000
GOLANG_PORT=8888
APP_ENV=production

# OpenAI API (Optional)
OPENAI_API_KEY=sk-your-openai-api-key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_NAME=TitipanQ <no-reply@titipanq.com>
SMTP_AUTH_EMAIL=your-email@gmail.com
SMTP_AUTH_PASSWORD=your-app-password

# JWT Secret (Generate secure key)
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend Environment (`.env.local`)

Buat file `frontend/.env.local.example`:

```dotenv
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8888/api/v1
NEXT_PUBLIC_ASSETS_URL=http://localhost:8888/assets

# Untuk production, ganti dengan domain/IP VPS:
# NEXT_PUBLIC_API_URL=http://your-vps-ip:8888/api/v1
# NEXT_PUBLIC_ASSETS_URL=http://your-vps-ip:8888/assets
```

---

## 🐳 Docker Configuration

### Backend Dockerfile

`backend/Dockerfile`:

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .

# Expose port
EXPOSE 8000

# Run
CMD ["./server"]
```

### Frontend Dockerfile

`frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expose port
EXPOSE 3000

# Run
CMD ["npm", "start"]
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: myapp-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    ports:
      - "${GOLANG_PORT:-8888}:${PORT:-8000}"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: myapp-frontend
    restart: unless-stopped
    env_file:
      - ./frontend/.env.local
    ports:
      - "${NGINX_PORT:-8080}:3000"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  pgdata:
```

---

## 🚀 Deployment Steps

### 1. Clone Repository

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Clone project
cd ~
git clone https://github.com/username/project-name.git
cd project-name
```

### 2. Setup Environment Files

```bash
# Copy dan edit backend env
cp backend/.env.example backend/.env
nano backend/.env

# Copy dan edit frontend env
cp frontend/.env.local.example frontend/.env.local
nano frontend/.env.local
```

**⚠️ PENTING**: Ubah nilai berikut:
- `DB_PASS`: Password database yang kuat
- `JWT_SECRET`: Secret key yang random
- `SMTP_AUTH_PASSWORD`: App password dari Gmail
- `NEXT_PUBLIC_API_URL`: Sesuaikan dengan IP/domain VPS

### 3. Build & Run Containers

```bash
# Build dan jalankan containers
docker compose up -d --build

# Tunggu beberapa saat untuk build selesai
# Monitor logs
docker compose logs -f
```

### 4. Verify Deployment

```bash
# Check running containers
docker compose ps

# Should show 3 containers: db, backend, frontend
# All should be in "Up" status

# Check backend health
curl http://localhost:8888/health

# Check frontend
curl http://localhost:8080
```

### 5. Test dari Browser

Buka browser dan akses:
- Frontend: `http://your-vps-ip:8080`
- Backend API: `http://your-vps-ip:8888`

---

## 🔧 Management & Monitoring

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Specific service

# Restart services
docker compose restart

# Stop services
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove with volumes
docker compose down -v

# Rebuild specific service
docker compose up -d --build backend

# Execute command in container
docker compose exec backend sh
docker compose exec db psql -U postgres -d titipanq
```

### Monitoring Resources

```bash
# Monitor Docker stats
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Database Management

```bash
# Access PostgreSQL
docker compose exec db psql -U postgres -d titipanq

# Backup database
docker compose exec db pg_dump -U postgres titipanq > backup_$(date +%Y%m%d).sql

# Restore database
docker compose exec -T db psql -U postgres titipanq < backup_20250101.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --build --no-deps backend
```

---

## 🐛 Troubleshooting

### Container tidak mau start

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs backend

# Rebuild dari awal
docker compose down -v
docker compose up -d --build
```

### Port sudah digunakan

```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :8888

# Kill process yang menggunakan port
sudo kill -9 <PID>
```

### Database connection error

```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec db psql -U postgres -d titipanq -c "SELECT 1;"
```

### Frontend tidak bisa connect ke Backend

- Pastikan `NEXT_PUBLIC_API_URL` di `.env.local` sudah benar
- Untuk production, gunakan IP/domain publik VPS, bukan `localhost`
- Check network di `docker-compose.yml`

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

### Permission denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker compose up -d
```

---

## 📌 Production Best Practices

1. **Security**:
   - Ganti semua default passwords
   - Gunakan strong JWT secret
   - Setup SSL/TLS dengan Nginx reverse proxy
   - Limit database port exposure

2. **Performance**:
   - Enable Docker logging driver
   - Setup container resource limits
   - Use multi-stage builds untuk optimize image size

3. **Backup**:
   - Schedule automatic database backups
   - Backup `.env` files securely
   - Version control semua konfigurasi

4. **Monitoring**:
   - Setup monitoring tools (Prometheus, Grafana)
   - Configure log aggregation
   - Setup alerts untuk critical issues

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
