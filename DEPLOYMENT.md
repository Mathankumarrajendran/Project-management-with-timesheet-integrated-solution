# VPS Deployment Guide
## PM System v1.0.1 — Hostinger KVM VPS (Ubuntu 22.04)

> Run every command below in your VPS terminal after connecting via SSH.

---

## Step 0 — Connect to Your VPS

From your local Windows machine (PowerShell or CMD):
```bash
ssh root@YOUR_VPS_IP
```

Hostinger provides the root password in **hPanel → VPS → Manage → Access**.

---

## Step 1 — Update the Server

```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw
```

---

## Step 2 — Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add root to docker group (so you don't need sudo)
usermod -aG docker root

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

---

## Step 3 — Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

---

## Step 4 — Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'    # opens ports 80 and 443
ufw --force enable
ufw status
```

---

## Step 5 — Clone the Repository

```bash
cd /opt
git clone https://github.com/Mathankumarrajendran/Project-management-with-timesheet-integrated-solution.git pm-system
cd pm-system
```

---

## Step 6 — Create Production Environment File

```bash
# Generate a strong JWT secret
openssl rand -base64 64

# Copy the template and fill in your values
cp backend/.env.production.example .env.prod
nano .env.prod
```

**Fill in these values in .env.prod:**

```env
NODE_ENV=production

DB_USER=pm_user
DB_PASSWORD=YourStrongDbPassword123!
DB_NAME=pm_system

REDIS_PASSWORD=YourStrongRedisPassword!

JWT_SECRET=<paste the openssl output here>
JWT_EXPIRES_IN=7d

# Replace with your actual VPS IP (or domain if you have one)
FRONTEND_URL=http://YOUR_VPS_IP
NEXT_PUBLIC_API_BASE_URL=http://YOUR_VPS_IP/api

EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

Save and exit: `Ctrl+X` → `Y` → `Enter`

---

## Step 7 — Configure Nginx Reverse Proxy

```bash
# Copy the Nginx config
cp nginx/pm-system.conf /etc/nginx/sites-available/pm-system

# Replace YOUR_DOMAIN_OR_IP with your actual VPS IP
sed -i 's/YOUR_DOMAIN_OR_IP/YOUR_VPS_IP/g' /etc/nginx/sites-available/pm-system

# Enable the site
ln -s /etc/nginx/sites-available/pm-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default   # remove default site

# Test config is valid
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 8 — Build and Start All Services

```bash
cd /opt/pm-system

# Build images and start everything (first time takes 5-10 minutes)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Watch startup logs
docker compose -f docker-compose.prod.yml logs -f
```

Wait until you see:
- `pm_postgres` — `database system is ready to accept connections`
- `pm_backend` — `Server running on port 5000`
- `pm_frontend` — `Ready in`

Press `Ctrl+C` to stop watching logs (services keep running).

---

## Step 9 — Seed the Database

```bash
# Run the seed script inside the backend container
docker compose -f docker-compose.prod.yml exec backend \
  sh -c "npx ts-node prisma/seed.ts"
```

> If ts-node is not available in the production image, run:
```bash
docker compose -f docker-compose.prod.yml exec backend \
  sh -c "node -e \"require('./dist/server')\"" 2>/dev/null; \
docker compose -f docker-compose.prod.yml exec backend \
  sh -c "npx prisma db seed" 2>/dev/null || echo "Seed completed or already seeded"
```

---

## Step 10 — Apply New DB Indexes (from v1.0.1)

```bash
docker compose -f docker-compose.prod.yml exec backend \
  sh -c "npx prisma migrate deploy"
```

---

## Step 11 — Verify Everything is Running

```bash
# Check all containers are up
docker compose -f docker-compose.prod.yml ps

# Test backend health
curl http://localhost:5000/api/health

# Test via Nginx (should return {"status":"OK"...})
curl http://YOUR_VPS_IP/api/health

# Test frontend is serving
curl -I http://YOUR_VPS_IP
```

**Expected responses:**
- Health check: `{"status":"OK","message":"Backend is running"}`
- Frontend: `HTTP/1.1 200 OK`

---

## Step 12 — Open Your App in a Browser

Navigate to: **`http://YOUR_VPS_IP`**

Login with:
- Email: `admin@pm-system.com`
- Password: `Admin@123456` *(change this immediately after first login)*

---

## Step 13 (Optional) — Set Up SSL with a Domain

> Only do this if you have a domain name pointing to your VPS IP.

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Issue SSL certificate (replace with your actual domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will ask for your email and automatically configure Nginx for HTTPS
# Test auto-renewal
certbot renew --dry-run
```

After SSL is set up, update `.env.prod`:
```env
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
```

Then rebuild the frontend:
```bash
docker compose -f docker-compose.prod.yml up -d --build frontend
```

---

## Ongoing Management Commands

```bash
# View live logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Pull latest code and redeploy
cd /opt/pm-system
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build

# Stop all services
docker compose -f docker-compose.prod.yml down

# View database via Prisma Studio (run temporarily)
docker compose -f docker-compose.prod.yml exec backend \
  sh -c "npx prisma studio --port 5555 --browser none" &
# Then SSH tunnel: ssh -L 5555:localhost:5555 root@YOUR_VPS_IP
```

---

## Security Checklist (Post-Deployment)

- [ ] Changed admin password after first login
- [ ] `.env.prod` is NOT in git (it's gitignored)
- [ ] Firewall is active (`ufw status`)
- [ ] PostgreSQL is NOT exposed to the internet (`docker compose ps` shows no host port for postgres)
- [ ] Redis is NOT exposed to the internet
- [ ] SSL certificate installed (if domain available)
- [ ] SSH key-based login configured (disable password login)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `docker: command not found` | Re-run Step 2, then `newgrp docker` |
| Backend container keeps restarting | `docker logs pm_backend` — check for `.env.prod` missing values |
| `nginx -t` fails | Check `/etc/nginx/sites-available/pm-system` for syntax errors |
| Frontend shows blank page | Check `NEXT_PUBLIC_API_BASE_URL` matches your VPS IP/domain |
| Cannot connect to DB | Verify `DB_PASSWORD` is same in `.env.prod` as set in Step 6 |
| Port 80 shows default Nginx page | Ensure `default` site was removed in Step 7 |

---

*For more info, see [SETUP.md](../SETUP.md) and [VERSIONING.md](../VERSIONING.md)*
