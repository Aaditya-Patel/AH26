# Production Deployment Guide - Google Cloud VM

This guide provides step-by-step instructions for deploying the Carbon Credit Marketplace application to Google Cloud VM (Compute Engine) in **production mode**.

---

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed locally
3. **Docker and Docker Compose** installed on VM
4. **Domain name** (optional but recommended) or static IP address
5. **OpenAI API Key** ready

---

## 🚀 Step 1: Create Google Cloud VM Instance

### **1.1 Create VM via Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Compute Engine** → **VM instances**
3. Click **Create Instance**
4. Configure:
   - **Name**: `carbon-marketplace-vm` (or your preferred name)
   - **Machine type**: `e2-medium` (2 vCPU, 4GB RAM) or larger
   - **Boot disk**: Ubuntu 22.04 LTS (or latest LTS)
   - **Boot disk size**: 30GB minimum
   - **Firewall**: Allow HTTP traffic and HTTPS traffic
   - **Region**: Choose closest to your users

5. Click **Create**

### **1.2 Create VM via gcloud CLI**

```bash
# Set variables
PROJECT_ID=your-project-id
ZONE=us-central1-a
INSTANCE_NAME=carbon-marketplace-vm

# Create VM
gcloud compute instances create $INSTANCE_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=e2-medium \
    --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=default \
    --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append \
    --create-disk=auto-delete=yes,boot=yes,device-name=$INSTANCE_NAME,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20240126,mode=rw,size=30,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-standard \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=goog-ec-src=vm_add-tf \
    --reservation-affinity=any
```

---

## 🔧 Step 2: Setup VM Environment

### **2.1 SSH into VM**

**Via Console:**
1. Go to VM instances
2. Click **SSH** button next to your instance

**Via gcloud CLI:**
```bash
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE
```

### **2.2 Install Docker and Docker Compose**

```bash
# Update system
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker  # Apply group change in current session
```

### **2.3 Install Git**

```bash
sudo apt-get install -y git
```

### **2.4 Install Additional Tools (Optional)**

```bash
# Install useful tools
sudo apt-get install -y \
    htop \
    nano \
    ufw \
    certbot
```

---

## 📦 Step 3: Deploy Application Code

### **3.1 Clone Repository**

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/AH26.git
cd AH26/carbon-credit-marketplace

# OR if you have the code locally, use SCP to upload
# From your local machine:
# scp -r carbon-credit-marketplace username@VM_IP:~/
```

### **3.2 Get VM External IP**

```bash
# Get VM external IP
curl ifconfig.me

# Or check via gcloud
gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Save this IP address - you'll need it for configuration.**

---

## ⚙️ Step 4: Configure Environment Variables

### **4.1 Create Production .env File**

```bash
# Create .env file
nano .env
```

**Add the following configuration (replace with your actual values):**

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_SECURE_PASSWORD@postgres:5432/carbonmarket

# Qdrant Configuration
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION_NAME=carbon_credits_kb

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here

# JWT Security (Generate a secure key)
SECRET_KEY=your-production-secret-key-min-32-characters-long-CHANGE-THIS

# App Configuration
ENVIRONMENT=production
DEBUG=False

# CORS Configuration - Replace YOUR_VM_IP with your actual VM IP
# Include ALL variations: with/without port, http/https
ALLOWED_ORIGINS=http://YOUR_VM_IP:3000,http://YOUR_VM_IP:5173,http://YOUR_VM_IP,http://YOUR_VM_IP:80,https://yourdomain.com,https://www.yourdomain.com

# Frontend API URL - Replace with your backend IP/domain
VITE_API_URL=http://YOUR_VM_IP:8000
# OR if using domain:
# VITE_API_URL=https://api.yourdomain.com

# Optional: Database Password (for Docker Compose)
POSTGRES_PASSWORD=your-secure-postgres-password-CHANGE-THIS
```

**Important:**
- Replace `YOUR_VM_IP` with your actual VM external IP address (from Step 3.2)
- Replace `your-openai-api-key-here` with your actual OpenAI API key
- Generate a secure `SECRET_KEY` (32+ characters)
- Generate a secure `POSTGRES_PASSWORD` (strong password)
- If using domain, update `ALLOWED_ORIGINS` and `VITE_API_URL` accordingly

### **4.2 Generate SECRET_KEY**

On the VM, run:

```bash
# Generate secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and update `SECRET_KEY` in `.env` file.

### **4.3 Generate POSTGRES_PASSWORD**

```bash
# Generate secure password
openssl rand -base64 32
```

Copy the output and update `POSTGRES_PASSWORD` in `.env` file, and also update `DATABASE_URL`.

---

## 🔥 Step 5: Configure Firewall Rules

### **5.1 Allow Required Ports**

```bash
# Allow backend port (8000)
gcloud compute firewall-rules create allow-backend \
    --allow tcp:8000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow backend API port 8000" \
    --direction INGRESS

# Allow frontend port (3000)
gcloud compute firewall-rules create allow-frontend \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow frontend port 3000" \
    --direction INGRESS

# Allow HTTPS (443) - for future SSL setup
gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTPS" \
    --direction INGRESS

# Allow HTTP (80) - for future SSL setup
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP" \
    --direction INGRESS

# Optional: Restrict to specific IP ranges (more secure)
# gcloud compute firewall-rules create allow-backend-restricted \
#     --allow tcp:8000 \
#     --source-ranges YOUR_OFFICE_IP/32,YOUR_HOME_IP/32 \
#     --description "Allow backend from specific IPs" \
#     --direction INGRESS
```

### **5.2 Verify Firewall Rules**

```bash
# List firewall rules
gcloud compute firewall-rules list
```

---

## 🐳 Step 6: Create Production Docker Compose

### **6.1 Create Production Compose File**

```bash
nano docker-compose.prod.yml
```

**Add the following:**

```yaml
services:
  postgres:
    image: postgres:15
    container_name: carbonmarket-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: carbonmarket
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  qdrant:
    image: qdrant/qdrant:latest
    container_name: carbonmarket-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - app-network

  backend:
    build: ./backend
    container_name: carbonmarket-backend
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    env_file: .env
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/carbonmarket
      - QDRANT_URL=http://qdrant:6333
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build: 
      context: ./frontend
      args:
        - VITE_API_URL=${VITE_API_URL:-http://localhost:8000}
    container_name: carbonmarket-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  qdrant_data:

networks:
  app-network:
    driver: bridge
```

### **6.2 Update Frontend Dockerfile for Production**

```bash
nano frontend/Dockerfile
```

**Update to production build:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - for SPA routing)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 🚀 Step 7: Deploy Application

### **7.1 Build and Start Services**

```bash
# Navigate to project directory
cd ~/AH26/carbon-credit-marketplace

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### **7.2 Wait for Services to Initialize**

Wait until you see:
```
✅ Database initialized
✅ Database seeded with mock data
✅ Qdrant initialized and documents ingested
✅ CORS configured with origins: [...]
```

**Check logs:**
```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs backend

# All logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Step 8: Verify Deployment

### **8.1 Check Backend Health**

```bash
# From VM
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

### **8.2 Check CORS Configuration**

```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS \
     -H "Origin: http://YOUR_VM_IP:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     http://localhost:8000/api/auth/register \
     -v

# Should return 200 OK with CORS headers
```

### **8.3 Check Frontend**

Open in browser: `http://YOUR_VM_IP:3000`

**Should:**
- Load the application
- Show landing page
- Allow registration/login
- Make API calls without CORS errors

### **8.4 Check API Documentation**

Open in browser: `http://YOUR_VM_IP:8000/docs`

**Should show Swagger UI with all endpoints.**

---

## 🔒 Step 9: Setup SSL/HTTPS (Optional but Recommended)

### **9.1 Install Certbot**

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### **9.2 Setup Nginx Reverse Proxy**

**Install Nginx:**
```bash
sudo apt-get install -y nginx
```

**Create Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/carbon-marketplace
```

**Add:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/carbon-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **9.3 Obtain SSL Certificate**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow prompts to configure SSL.**

---

## 🔄 Step 10: Setup Automatic Startup

### **10.1 Create Systemd Service (Optional)**

```bash
sudo nano /etc/systemd/system/carbon-marketplace.service
```

**Add:**
```ini
[Unit]
Description=Carbon Credit Marketplace
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USERNAME/AH26/carbon-credit-marketplace
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**Enable service:**
```bash
sudo systemctl enable carbon-marketplace.service
sudo systemctl start carbon-marketplace.service
```

**Replace `YOUR_USERNAME` with your actual username.**

---

## 📊 Step 11: Monitoring and Maintenance

### **11.1 View Logs**

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### **11.2 Restart Services**

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### **11.3 Update Application**

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### **11.4 Backup Database**

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres carbonmarket > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres carbonmarket < backup_YYYYMMDD_HHMMSS.sql
```

---

## 🐛 Troubleshooting Production Issues

### **Issue 1: Services Won't Start**

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### **Issue 2: CORS Errors**

```bash
# Check ALLOWED_ORIGINS in .env
cat .env | grep ALLOWED_ORIGINS

# Check backend logs for CORS configuration
docker compose -f docker-compose.prod.yml logs backend | grep CORS

# Update .env with correct origins and restart
docker compose -f docker-compose.prod.yml restart backend
```

### **Issue 3: Port Already in Use**

```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :3000

# Kill process or change ports in docker-compose.prod.yml
```

### **Issue 4: Out of Memory**

```bash
# Check memory usage
free -h

# Upgrade VM instance type
gcloud compute instances set-machine-type $INSTANCE_NAME \
    --machine-type=e2-large \
    --zone=$ZONE
```

---

## 📝 Production Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] `SECRET_KEY` is strong and unique (32+ characters)
- [ ] `POSTGRES_PASSWORD` is strong and secure
- [ ] `ALLOWED_ORIGINS` includes all frontend URLs
- [ ] `ENVIRONMENT=production` and `DEBUG=False`
- [ ] Firewall rules allow required ports
- [ ] Services start successfully
- [ ] Backend health check passes
- [ ] Frontend loads and connects to backend
- [ ] CORS preflight requests work (200 OK)
- [ ] SSL/HTTPS configured (if using domain)
- [ ] Database backups are scheduled
- [ ] Monitoring/logging is configured
- [ ] Auto-startup is configured (optional)

---

## 🎯 Quick Reference Commands

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d --build

# Stop services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# Check status
docker compose -f docker-compose.prod.yml ps

# Access container shell
docker compose -f docker-compose.prod.yml exec backend bash
```

---

**Congratulations! Your application is now deployed to production! 🚀**
