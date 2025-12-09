#!/bin/bash
# ============================================================
# DigitalOcean Droplet Setup Script
# 
# Run this on a fresh Ubuntu 22.04 droplet to set up the blog.
# 
# Usage:
#   1. Create a new droplet (Ubuntu 22.04, SFO3 region)
#   2. SSH in: ssh root@<droplet-ip>
#   3. Run: curl -sL https://raw.githubusercontent.com/hrosenblume/blog/main/scripts/setup-droplet.sh | bash
#   Or copy this script and run it manually.
# ============================================================

set -e  # Exit on any error

echo "🚀 Starting droplet setup..."

# ============================================================
# 1. SYSTEM UPDATES
# ============================================================
echo "📦 Updating system packages..."
apt update && apt upgrade -y

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
# 4. SET UP SWAP (prevents OOM crashes)
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
# 5. CLONE REPOSITORY
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
# 6. INSTALL DEPENDENCIES
# ============================================================
echo "📦 Installing npm dependencies..."
npm install

# ============================================================
# 7. ENVIRONMENT VARIABLES
# ============================================================
echo ""
echo "============================================================"
echo "⚠️  ENVIRONMENT VARIABLES REQUIRED"
echo "============================================================"
echo ""
echo "Create /var/www/blog/.env.local with these variables:"
echo ""
echo "  DATABASE_URL=\"postgresql://...\"      # DO Managed PostgreSQL"
echo "  NEXTAUTH_SECRET=\"...\"                # Random secret"
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
# 8. BUILD APPLICATION
# ============================================================
echo "🔨 Building application..."
cd /var/www/blog
npx prisma generate --schema=prisma/schema.postgresql.prisma
npm run build:prod

# ============================================================
# 9. START WITH PM2
# ============================================================
echo "🚀 Starting application with PM2..."
pm2 delete blog 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js --only blog
pm2 save
pm2 startup

# ============================================================
# 10. SET UP LOG ROTATION
# ============================================================
echo "📋 Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:compress true

# ============================================================
# DONE!
# ============================================================
echo ""
echo "============================================================"
echo "✅ SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "Your app is running at: http://$(curl -s ifconfig.me):3000"
echo ""
echo "Next steps:"
echo "  1. Test: curl -I http://localhost:3000"
echo "  2. Update Cloudflare DNS A record to: $(curl -s ifconfig.me)"
echo "  3. Update GitHub secret DO_HOST to: $(curl -s ifconfig.me)"
echo "  4. Enable Backups in DO Dashboard (Droplet → Backups)"
echo "  5. Set up Monitoring Alerts in DO Dashboard"
echo ""
echo "Useful commands:"
echo "  pm2 status          # Check app status"
echo "  pm2 logs blog       # View logs"
echo "  pm2 restart blog    # Restart app"
echo ""

