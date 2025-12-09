#!/bin/bash
# ============================================================
# DigitalOcean Droplet Setup Script
# 
# Run this on a fresh Ubuntu 22.04 droplet to set up the blog.
# 
# Usage:
#   1. Create a new droplet (Ubuntu 22.04, SFO3 region)
#   2. SSH in: ssh root@<droplet-ip>
#   3. Download and run:
#      curl -sL https://raw.githubusercontent.com/hrosenblume/blog/main/scripts/setup-droplet.sh -o setup.sh
#      chmod +x setup.sh && ./setup.sh
# ============================================================

set -e  # Exit on any error

echo "🚀 Starting droplet setup..."

# ============================================================
# 1. SYSTEM UPDATES
# ============================================================
echo "📦 Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y -o Dpkg::Options::="--force-confold" -o Dpkg::Options::="--force-confdef"

# ============================================================
# 2. INSTALL NODE.JS 20
# ============================================================
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# ============================================================
# 3. INSTALL PM2
# ============================================================
echo "📦 Installing PM2..."
npm install -g pm2

# ============================================================
# 4. INSTALL & CONFIGURE NGINX
# ============================================================
echo "📦 Installing Nginx..."
apt install -y nginx

echo "🔧 Configuring Nginx..."
cat > /etc/nginx/sites-available/blog << 'NGINX_EOF'
server {
    listen 80;
    server_name hunterrosenblume.com www.hunterrosenblume.com;

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
}
NGINX_EOF

# Enable the site and remove default
ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
nginx -t && systemctl restart nginx && systemctl enable nginx
echo "✅ Nginx configured and running"

# ============================================================
# 5. SET UP SWAP (prevents OOM crashes)
# ============================================================
echo "💾 Setting up 2GB swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap created and enabled."
else
    echo "Swap already exists, skipping."
fi

# ============================================================
# 6. CLONE REPOSITORY
# ============================================================
echo "📂 Setting up app directory..."
mkdir -p /var/www/blog
cd /var/www/blog

if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git fetch origin main
    git reset --hard origin/main
else
    echo "Cloning repository..."
    git clone https://github.com/hrosenblume/blog.git .
fi

# ============================================================
# 7. INSTALL DEPENDENCIES
# ============================================================
echo "📦 Installing npm dependencies..."
npm install

# ============================================================
# 8. ENVIRONMENT VARIABLES
# ============================================================
echo ""
echo "============================================================"
echo "⚠️  ENVIRONMENT VARIABLES REQUIRED"
echo "============================================================"
echo ""
echo "Create /var/www/blog/.env.local with these variables:"
echo ""
echo "  DATABASE_URL_PROD=\"postgresql://...\"   # DO Managed PostgreSQL"
echo "  NEXTAUTH_SECRET=\"...\"                  # Random secret (openssl rand -base64 32)"
echo "  AUTH_TRUST_HOST=true"
echo "  GOOGLE_CLIENT_ID=\"...\""
echo "  GOOGLE_CLIENT_SECRET=\"...\""
echo "  NEXT_PUBLIC_CONTACT_EMAIL=\"...\""
echo "  NEXT_PUBLIC_SITE_URL=\"https://hunterrosenblume.com\""
echo ""
echo "Run: nano /var/www/blog/.env.local"
echo ""
read -p "Press Enter after creating .env.local to continue..."

# ============================================================
# 9. CREATE STARTUP WRAPPER SCRIPT
# ============================================================
echo "📝 Creating startup script..."
cat > /var/www/blog/start.sh << 'START_EOF'
#!/bin/bash
cd /var/www/blog
set -a
source .env.local
set +a
exec npm start
START_EOF

chmod +x /var/www/blog/start.sh

# ============================================================
# 10. CREATE PM2 ECOSYSTEM CONFIG
# ============================================================
echo "📝 Creating PM2 ecosystem config..."
cat > /var/www/blog/ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'blog',
      cwd: '/var/www/blog',
      script: './start.sh',
      interpreter: '/bin/bash',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
PM2_EOF

# ============================================================
# 11. BUILD APPLICATION
# ============================================================
echo "🔨 Building application..."
cd /var/www/blog
npx prisma generate --schema=prisma/schema.postgresql.prisma
npm run build:prod

# ============================================================
# 12. START WITH PM2
# ============================================================
echo "🚀 Starting application with PM2..."
pm2 delete blog 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js --only blog
pm2 save
pm2 startup

# ============================================================
# 13. SET UP LOG ROTATION
# ============================================================
echo "📋 Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:compress true

# ============================================================
# DONE!
# ============================================================
DROPLET_IP=$(curl -s ifconfig.me)

echo ""
echo "============================================================"
echo "✅ SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "Your app is running at: http://${DROPLET_IP}"
echo ""
echo "Next steps:"
echo "  1. Test: curl -I http://localhost:3000"
echo "  2. Update Cloudflare DNS A record to: ${DROPLET_IP}"
echo "  3. Set Cloudflare SSL mode to: Flexible"
echo "  4. Update GitHub secret DO_HOST to: ${DROPLET_IP}"
echo "  5. Enable Backups in DO Dashboard (Droplet → Backups)"
echo ""
echo "Useful commands:"
echo "  pm2 status          # Check app status"
echo "  pm2 logs blog       # View logs"
echo "  pm2 restart blog    # Restart app"
echo "  systemctl status nginx  # Check nginx"
echo ""
