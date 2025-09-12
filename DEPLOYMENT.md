# PunchTracker MVP v2.0 - Deployment Guide

## 🚀 Quick Start (Local Development)

### 1. **Environment Setup**
```bash
# Copy environment file
copy env.example .env

# Edit .env file with your settings
# At minimum, set:
# JWT_SECRET=your-super-secret-jwt-key-here
# POSTGRES_PASSWORD=your-secure-password
```

### 2. **Start Services**
```bash
cd infra
docker-compose up -d
```

### 3. **Run Database Migrations**
```bash
# Wait for services to start, then run migrations
docker-compose exec backend alembic upgrade head
```

### 4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Grafana: http://localhost:3001 (admin/admin)

---

## 🌐 Production Deployment Options

### **Option A: Cloud VPS (Recommended for MVP)**

#### **DigitalOcean/AWS EC2/Linode**

1. **Server Setup**
   ```bash
   # Ubuntu 20.04+ server
   sudo apt update && sudo apt upgrade -y
   sudo apt install docker.io docker-compose git nginx certbot python3-certbot-nginx -y
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/Shunmuka/Punch-Tracker.git
   cd Punch-Tracker
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   nano .env
   ```
   
   **Required Production Settings:**
   ```bash
   # Database
   POSTGRES_PASSWORD=your-very-secure-password
   
   # JWT Security
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # Email (Optional but recommended)
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   
   # Notifications (Optional)
   SLACK_WEBHOOK_DEFAULT=your-slack-webhook-url
   DISCORD_WEBHOOK_DEFAULT=your-discord-webhook-url
   ```

4. **Deploy with Docker**
   ```bash
   cd infra
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

5. **Setup Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/punchtracker
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/punchtracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

### **Option B: Docker Swarm (Scalable)**

1. **Initialize Swarm**
   ```bash
   docker swarm init
   ```

2. **Deploy Stack**
   ```bash
   docker stack deploy -c docker-compose.swarm.yml punchtracker
   ```

---

### **Option C: Kubernetes (Enterprise)**

1. **Create Kubernetes Manifests**
   ```yaml
   # k8s/namespace.yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: punchtracker
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

---

## 🔧 Production Configuration

### **Environment Variables (Production)**

```bash
# Database
POSTGRES_DB=punchtracker
POSTGRES_USER=punchtracker
POSTGRES_PASSWORD=your-very-secure-password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=PunchTracker

# Notifications
REPORT_SCHEDULE_CRON=0 8 * * 1
SLACK_WEBHOOK_DEFAULT=your-slack-webhook
DISCORD_WEBHOOK_DEFAULT=your-discord-webhook

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

### **Docker Compose Production Override**

Create `infra/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    restart: unless-stopped
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    volumes:
      - /var/log/punchtracker:/app/logs
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=https://yourdomain.com/api
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  postgres:
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - /var/backups/postgres:/backups
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 📊 Monitoring & Maintenance

### **Health Checks**
```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database health
docker-compose exec postgres pg_isready -U postgres
```

### **Backup Strategy**
```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres punchtracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres punchtracker > /var/backups/punchtracker_$DATE.sql
find /var/backups -name "punchtracker_*.sql" -mtime +7 -delete
```

### **Updates**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall (ports 80, 443 only)
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS redirects
- [ ] Configure CORS properly

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   ```bash
   # Check if postgres is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **JWT Token Issues**
   ```bash
   # Verify JWT_SECRET is set
   docker-compose exec backend env | grep JWT
   ```

3. **Frontend Not Loading**
   ```bash
   # Check if frontend is running
   docker-compose ps frontend
   
   # Check API connection
   curl http://localhost:8000/health
   ```

4. **Email Not Sending**
   ```bash
   # Check SendGrid configuration
   docker-compose exec backend python -c "import os; print(os.getenv('SENDGRID_API_KEY'))"
   ```

### **Performance Optimization**

1. **Database Indexing**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_punches_user_id ON punches(session_id);
   CREATE INDEX idx_sessions_user_id ON sessions(user_id);
   CREATE INDEX idx_punches_timestamp ON punches(timestamp);
   ```

2. **Redis Caching**
   - Weekly analytics are cached for 5 minutes
   - Session data cached for 1 hour
   - User profiles cached for 30 minutes

3. **Nginx Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

---

## 📈 Scaling Considerations

### **Horizontal Scaling**
- Use load balancer (nginx/HAProxy)
- Multiple backend instances
- Database read replicas
- Redis cluster for caching

### **Database Scaling**
- PostgreSQL read replicas
- Connection pooling (PgBouncer)
- Database sharding by user

### **Monitoring**
- Prometheus + Grafana (included)
- Application metrics
- Database performance monitoring
- Log aggregation (ELK stack)

---

## 🎯 Next Steps After Deployment

1. **Test All Features**
   - User registration/login
   - Punch logging
   - Analytics dashboard
   - Coach features
   - Notifications

2. **Configure Monitoring**
   - Set up Grafana dashboards
   - Configure alerts
   - Monitor performance

3. **Security Hardening**
   - Regular security updates
   - SSL certificate renewal
   - Backup verification

4. **User Onboarding**
   - Create admin accounts
   - Test coach-athlete relationships
   - Verify notification delivery

Your PunchTracker MVP v2.0 is now ready for production deployment! 🥊✨
