# Google Cloud VM Deployment Guide

## 🚀 Prerequisites

- Google Cloud VM instance running
- Docker and Docker Compose installed on VM
- Port 8000 (backend) and 3000 (frontend) open in firewall
- Domain name or static IP address (optional but recommended)

---

## 📋 Step-by-Step Deployment

### **Step 1: Set Up Environment Variables**

Create a `.env` file on your VM in the project root:

```bash
# Backend Configuration
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/carbonmarket
QDRANT_URL=http://qdrant:6333
SECRET_KEY=your-production-secret-key-min-32-characters-long-change-this
ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24:5173,http://yourdomain.com

# Frontend Configuration (for docker-compose)
VITE_API_URL=http://136.115.152.24:8000

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# Environment
ENVIRONMENT=production
DEBUG=False
```

### **Step 2: Configure CORS for Google Cloud VM**

#### **Option A: Using IP Address (Current Setup)**

If your frontend is accessed via IP `136.115.152.24`:

```bash
ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24:5173,http://136.115.152.24
```

**Include ALL variations:**
- `http://136.115.152.24:3000` (with port)
- `http://136.115.152.24:5173` (Vite dev server)
- `http://136.115.152.24` (without port, if using default port)

#### **Option B: Using Domain Name (Recommended)**

If you have a domain name:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://yourdomain.com
```

#### **Option C: Using Wildcard (Not Recommended for Production)**

⚠️ **Warning:** Using `*` disables credentials (cookies/JWT tokens won't work properly):

```bash
ALLOWED_ORIGINS=*
```

**This will:**
- ✅ Allow all origins
- ❌ Disable `allow_credentials` (cookies/auth tokens may not work)
- ❌ Less secure

---

### **Step 3: Configure Frontend API URL**

Update your `.env` file or set environment variable when building frontend:

```bash
# For Docker Compose
VITE_API_URL=http://136.115.152.24:8000

# OR for production build, create .env.production
echo "VITE_API_URL=http://136.115.152.24:8000" > frontend/.env.production
```

**Important:** 
- If frontend and backend are on the same VM, use the VM's internal IP or `localhost`
- If frontend and backend are on different VMs, use the backend VM's external IP or domain

---

### **Step 4: Update Docker Compose for Production**

Create `docker-compose.prod.yml`:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: carbonmarket
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - qdrant
    env_file: .env
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/carbonmarket
      - QDRANT_URL=http://qdrant:6333
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      args:
        - VITE_API_URL=${VITE_API_URL:-http://localhost:8000}
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  qdrant_data:
```

---

### **Step 5: Deploy on Google Cloud VM**

#### **5.1 SSH into VM**
```bash
gcloud compute ssh your-instance-name --zone=your-zone
```

#### **5.2 Clone Repository**
```bash
git clone https://github.com/your-repo/AH26.git
cd AH26/carbon-credit-marketplace
```

#### **5.3 Create .env File**
```bash
nano .env
# Paste your environment variables (see Step 1)
```

#### **5.4 Update ALLOWED_ORIGINS**
```bash
# In .env file, set:
ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24,http://YOUR_VM_IP:3000
```

**Important:** Replace `136.115.152.24` with your actual VM external IP address.

#### **5.5 Start Services**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

### **Step 6: Configure Firewall Rules**

Allow traffic on required ports:

```bash
# Backend port
gcloud compute firewall-rules create allow-backend \
    --allow tcp:8000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow backend API"

# Frontend port
gcloud compute firewall-rules create allow-frontend \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow frontend"

# Or use one rule for both
gcloud compute firewall-rules create allow-app \
    --allow tcp:8000,tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow carbon marketplace app"
```

---

### **Step 7: Verify Deployment**

#### **7.1 Check Backend**
```bash
curl http://136.115.152.24:8000/health
# Should return: {"status":"healthy"}
```

#### **7.2 Check CORS Headers**
```bash
curl -H "Origin: http://136.115.152.24:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     http://136.115.152.24:8000/api/auth/register \
     -v
```

**Expected Response:**
```
< HTTP/1.1 200 OK
< access-control-allow-origin: http://136.115.152.24:3000
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
< access-control-allow-headers: *
< access-control-allow-credentials: true
```

#### **7.3 Test Frontend**
Open browser: `http://136.115.152.24:3000`
- Should load the application
- Should be able to register/login
- Should be able to make API calls without CORS errors

---

## 🔧 Troubleshooting CORS Issues

### **Issue 1: "Preflight response is not successful. Status code: 400"**

**Cause:** The frontend origin is not in the `ALLOWED_ORIGINS` list.

**Solution:**
1. Check your VM's external IP:
   ```bash
   curl ifconfig.me
   # Or
   gcloud compute instances describe your-instance-name --zone=your-zone --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
   ```

2. Update `.env` file:
   ```bash
   ALLOWED_ORIGINS=http://YOUR_VM_IP:3000,http://YOUR_VM_IP:5173,http://YOUR_VM_IP
   ```

3. Restart backend:
   ```bash
   docker-compose restart backend
   ```

4. Check backend logs:
   ```bash
   docker-compose logs backend | grep CORS
   # Should show: ✅ CORS configured with origins: [...]
   ```

### **Issue 2: "Failed to load resource: Network error"**

**Cause:** Backend is not accessible or firewall is blocking.

**Solution:**
1. Check if backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check firewall rules:
   ```bash
   gcloud compute firewall-rules list
   ```

3. Check if port is open:
   ```bash
   nc -zv YOUR_VM_IP 8000
   ```

### **Issue 3: "401 Unauthorized" after login**

**Cause:** CORS is using wildcard (`*`) which disables credentials.

**Solution:**
1. Don't use `ALLOWED_ORIGINS=*`
2. Specify exact origins:
   ```bash
   ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24
   ```

### **Issue 4: CORS works but API calls fail**

**Cause:** Frontend API URL is incorrect.

**Solution:**
1. Check frontend environment:
   ```bash
   # In browser console:
   console.log(import.meta.env.VITE_API_URL)
   ```

2. Update frontend `.env` or rebuild:
   ```bash
   VITE_API_URL=http://136.115.152.24:8000
   docker-compose build frontend
   docker-compose up -d frontend
   ```

---

## 📝 Environment Variable Examples

### **For Development (Local)**
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
VITE_API_URL=http://localhost:8000
ENVIRONMENT=development
```

### **For Production (VM with IP)**
```bash
ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24
VITE_API_URL=http://136.115.152.24:8000
ENVIRONMENT=production
DEBUG=False
```

### **For Production (VM with Domain)**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
ENVIRONMENT=production
DEBUG=False
```

---

## 🔒 Security Best Practices

### **1. Use HTTPS in Production**
```bash
# Use nginx or traefik as reverse proxy with SSL
ALLOWED_ORIGINS=https://yourdomain.com
```

### **2. Don't Use Wildcard (*) in Production**
```bash
# ❌ Bad
ALLOWED_ORIGINS=*

# ✅ Good
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### **3. Use Strong Secret Key**
```bash
# Generate a secure key:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Set in .env:
SECRET_KEY=your-generated-secret-key-here
```

### **4. Restrict Firewall to Specific IPs (Optional)**
```bash
# Only allow your office IP
gcloud compute firewall-rules create allow-app-restricted \
    --allow tcp:8000,tcp:3000 \
    --source-ranges YOUR_OFFICE_IP/32 \
    --description "Allow app from office IP only"
```

---

## 🎯 Quick Fix for Your Current Issue

Based on your error, here's the immediate fix:

### **1. Get Your VM IP**
```bash
# SSH into VM and run:
curl ifconfig.me
# Or check Google Cloud Console
```

### **2. Update Backend .env**
```bash
# In your .env file:
ALLOWED_ORIGINS=http://136.115.152.24:3000,http://136.115.152.24:5173,http://136.115.152.24
```

### **3. Restart Backend**
```bash
docker-compose restart backend
# Or if using docker-compose.prod.yml:
docker-compose -f docker-compose.prod.yml restart backend
```

### **4. Update Frontend .env**
```bash
# In frontend/.env or .env.production:
VITE_API_URL=http://136.115.152.24:8000
```

### **5. Rebuild Frontend (if needed)**
```bash
docker-compose build frontend
docker-compose up -d frontend
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health check works: `curl http://YOUR_VM_IP:8000/health`
- [ ] CORS preflight (OPTIONS) returns 200: `curl -X OPTIONS -H "Origin: http://YOUR_VM_IP:3000" http://YOUR_VM_IP:8000/api/auth/register -v`
- [ ] Frontend loads: `http://YOUR_VM_IP:3000`
- [ ] Registration works without CORS errors
- [ ] Login works and JWT token is received
- [ ] API calls work from frontend console (no CORS errors)
- [ ] Backend logs show: `✅ CORS configured with origins: [...]`

---

## 📞 Common Error Messages and Solutions

### **"Failed to load resource: Preflight response is not successful. Status code: 400"**
→ **Fix:** Add your frontend origin to `ALLOWED_ORIGINS`

### **"Access to fetch blocked by CORS policy: No 'Access-Control-Allow-Origin' header"**
→ **Fix:** Check `ALLOWED_ORIGINS` includes exact origin (including protocol and port)

### **"CORS policy: Credentials flag is 'true', but 'Access-Control-Allow-Origin' is '*'"**
→ **Fix:** Don't use `*`, specify exact origins in `ALLOWED_ORIGINS`

### **"Network request failed"**
→ **Fix:** Check firewall rules and backend is accessible

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with exact origins (no wildcard)
- [ ] Use HTTPS (set up reverse proxy with SSL)
- [ ] Set up proper database backups
- [ ] Configure logging and monitoring
- [ ] Test all endpoints work
- [ ] Test registration/login flow
- [ ] Verify CORS works for all endpoints
- [ ] Check firewall rules are secure
- [ ] Set up domain name (optional but recommended)

---

## 📚 Additional Resources

- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [Google Cloud VM Documentation](https://cloud.google.com/compute/docs)
- [Docker Compose Production Guide](https://docs.docker.com/compose/production/)

---

**Need Help?** Check backend logs: `docker-compose logs backend | grep -i cors`
