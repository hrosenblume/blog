<!-- f0b8253c-fd62-40e7-b8fd-4c245666368e 5c8be652-67cc-4f28-bcce-6e303d8ce928 -->
# Deploy to DigitalOcean with Cloudflare CDN

This plan deploys your blog to a $6/month DigitalOcean droplet with Cloudflare in front for CDN, DDoS protection, and edge caching. No code changes required - SQLite and file uploads work as-is.

---

## Domain Configuration

| Environment | Primary Domain | Description |
|-------------|----------------|-------------|
| **Development** | `localhost:3000` | Local dev server |
| **Production** | `hunterrosenblume.com` | Canonical URL (appears in browser) |

### Alias Domains (301 redirect to primary)

These domains all redirect to `hunterrosenblume.com`:

- `hunterr.net`
- `hrosenblume.com`
- `hunterosenblu.me`
- `hunterr.org`

All alias domains 301 redirect to the primary domain. This means:
- The URL bar will always show `hunterrosenblume.com`
- OAuth callbacks only need to be configured for `hunterrosenblume.com`
- SEO is consolidated on one canonical URL

---

## CURSOR INSTRUCTIONS: Required User Input

**CRITICAL FOR CURSOR:** Before executing ANY phase of this plan, you MUST use the `ask_question` tool to collect the following values from the user. Do NOT proceed without these answers. Do NOT guess or use placeholders. Ask all questions upfront before running any commands.

### Questions Cursor Must Ask (use ask_question tool)

1. **GitHub Repo:** "What is your GitHub repository URL? (e.g., https://github.com/username/blog.git)"
2. **Droplet IP:** "What is your DigitalOcean droplet IP address? (Create the droplet first per Phase 1, then provide the IP)"
3. **Google Client ID:** "What is your GOOGLE_CLIENT_ID from Google Cloud Console?"
4. **Google Client Secret:** "What is your GOOGLE_CLIENT_SECRET from Google Cloud Console?"
5. **NextAuth Secret:** "Do you have a NEXTAUTH_SECRET, or should I generate one? (I can run `openssl rand -base64 32` to generate one)"

### Variable Substitution

| Variable | Value |
|----------|-------|
| `DROPLET_IP` | DigitalOcean droplet IP (after creation) |
| `GITHUB_REPO` | Your GitHub repo URL |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `NEXTAUTH_SECRET` | Random 32+ char string (generate with `openssl rand -base64 32`) |

---

## Phase 1: DigitalOcean Droplet Setup (Manual - User Action)

**User must do this in DigitalOcean dashboard:**

1. Create Droplet:

   - **Image**: Ubuntu 24.04 LTS
   - **Size**: Basic $6/month (1GB RAM, 1 vCPU)
   - **Region**: Choose closest to your audience
   - **Authentication**: Add SSH key (recommended) or use password
   - **Hostname**: `blog`

2. Note the **Droplet IP** once created - you'll need it for the next phases.

---

## Phase 2: Server Configuration

SSH into the droplet and run these commands:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Caddy (reverse proxy + auto SSL)
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# Create app directory
mkdir -p /var/www/blog
```

---

## Phase 3: Deploy Application

```bash
cd /var/www/blog

# Clone repository
git clone $GITHUB_REPO .

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

Create environment file at `/var/www/blog/.env`:

```env
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_URL="https://hunterrosenblume.com"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
```

**Important:** `NEXTAUTH_URL` must be `https://hunterrosenblume.com` (the primary domain). All alias domains redirect here before OAuth begins, so authentication works correctly.

Initialize database and build:

```bash
# Create database and apply schema
npx prisma db push

# Seed admin user (creates your-email@example.com as admin)
npm run db:seed

# Create uploads directory
mkdir -p public/uploads

# Build the application
npm run build
```

---

## Phase 4: Start Application with PM2

```bash
cd /var/www/blog

# Start the standalone server
pm2 start npm --name "blog" -- start

# Save PM2 config and enable startup on boot
pm2 save
pm2 startup
```

Verify it's running:

```bash
pm2 status
curl http://localhost:3000  # Should return HTML
```

---

## Phase 5: Configure Caddy Reverse Proxy

Edit `/etc/caddy/Caddyfile`:

```
# Primary domain - serves the app
hunterrosenblume.com {
    reverse_proxy localhost:3000
}

# Alias domains - 301 redirect to primary (updates URL bar)
hunterr.net {
    redir https://hunterrosenblume.com{uri} permanent
}

hrosenblume.com {
    redir https://hunterrosenblume.com{uri} permanent
}

hunterosenblu.me {
    redir https://hunterrosenblume.com{uri} permanent
}

hunterr.org {
    redir https://hunterrosenblume.com{uri} permanent
}
```

The `{uri}` preserves the path, so `hrosenblume.com/e/my-essay` redirects to `hunterrosenblume.com/e/my-essay`.

Restart Caddy:

```bash
systemctl restart caddy
systemctl status caddy  # Verify running
```

Caddy automatically provisions SSL certificates via Let's Encrypt for ALL domains (primary + aliases).

---

## Phase 6: Cloudflare Setup (Manual - User Action)

**User must do this in Cloudflare dashboard for ALL 5 domains:**

### Domains to configure:

1. `hunterrosenblume.com` (primary)
2. `hunterr.net` (alias)
3. `hrosenblume.com` (alias)
4. `hunterosenblu.me` (alias)
5. `hunterr.org` (alias)

### For Each Domain (repeat 5 times):

1. **Add Site**:
   - Go to cloudflare.com, add the domain
   - Cloudflare will scan existing DNS records

2. **Update Nameservers**:
   - At your domain registrar, change nameservers to Cloudflare's
   - Wait for propagation (can take up to 24 hours, usually faster)

3. **Add DNS Record**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | `$DROPLET_IP` | Proxied (orange cloud ON) |

4. **SSL Settings**:
   - Go to SSL/TLS > Overview
   - Set encryption mode to **Full (strict)**

5. **Edge Certificates**:
   - SSL/TLS > Edge Certificates
   - Enable "Always Use HTTPS"

6. **Caching** (optional, for primary domain):
   - Go to Caching > Configuration
   - Set Browser Cache TTL to "Respect Existing Headers"

**Note:** You don't need to set up redirect rules in Cloudflare — Caddy handles the 301 redirects on the server. Cloudflare just needs to route traffic to your droplet for all domains.

---

## Phase 7: Update Google OAuth (Manual - User Action)

**User must do this in Google Cloud Console:**

1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://hunterrosenblume.com/api/auth/callback/google
   ```

4. Save changes

**Note:** You only need the primary domain (`hunterrosenblume.com`). All alias domains 301 redirect to it before any OAuth flow begins, so users always authenticate on the primary domain.

---

## Phase 8: Verify Deployment

Test the primary domain:

- `https://hunterrosenblume.com` - Public homepage
- `https://hunterrosenblume.com/writer` - Should redirect to sign-in
- `https://hunterrosenblume.com/admin` - Should redirect to sign-in
- Sign in with Google, verify auth works

Test alias domain redirects (verify URL bar updates to hunterrosenblume.com):

- `https://hunterr.net` → should redirect to `https://hunterrosenblume.com`
- `https://hrosenblume.com` → should redirect to `https://hunterrosenblume.com`
- `https://hunterosenblu.me` → should redirect to `https://hunterrosenblume.com`
- `https://hunterr.org` → should redirect to `https://hunterrosenblume.com`
- `https://hrosenblume.com/e/some-essay` → should redirect to `https://hunterrosenblume.com/e/some-essay`

---

## Ongoing Deployments

When you push updates to GitHub, SSH into the server and run:

```bash
cd /var/www/blog
git pull
npm install
npm run build
pm2 restart blog
```

Or create a deploy script at `/var/www/blog/deploy.sh`:

```bash
#!/bin/bash
cd /var/www/blog
git pull origin main
npm install
npm run build
pm2 restart blog
echo "Deployed at $(date)"
```

Make executable: `chmod +x deploy.sh`

---

## Files Referenced

- [`next.config.js`](next.config.js) - Already has `output: 'standalone'` configured
- [`prisma/schema.prisma`](prisma/schema.prisma) - SQLite database schema
- [`prisma/seed.ts`](prisma/seed.ts) - Seeds admin user (your-email@example.com)
- [`lib/auth.ts`](lib/auth.ts) - NextAuth config with Google OAuth
- [`app/api/upload/route.ts`](app/api/upload/route.ts) - File uploads to `public/uploads/`

---

## Costs

| Service | Monthly Cost |
|---------|--------------|
| DigitalOcean Droplet (1GB) | $6 |
| Cloudflare (all domains) | Free |
| Primary domain | ~$12/year |
| Each alias domain | ~$12/year each |
| **Total** | ~$7/month + domain costs |

---

## Troubleshooting

**App not loading:**

```bash
pm2 logs blog --lines 50  # Check app logs
systemctl status caddy     # Check Caddy status
```

**SSL not working:**

- Ensure Cloudflare SSL is set to "Full (strict)" for ALL domains
- Check Caddy logs: `journalctl -u caddy`

**Auth not working:**

- Verify NEXTAUTH_URL is exactly `https://hunterrosenblume.com`
- Verify Google OAuth redirect URI is `https://hunterrosenblume.com/api/auth/callback/google`
- Check `.env` file has correct values

**Alias domain not redirecting:**

- Check that the alias domain is added to Cloudflare with correct A record
- Verify the Caddyfile has a redirect block for that domain
- Test with curl: `curl -I https://hrosenblume.com` — should show `301` and `Location: https://hunterrosenblume.com/`

**Database issues:**

```bash
cd /var/www/blog
npx prisma studio  # Opens database GUI on port 5555
```

---

## Production Readiness Assessment

### ✅ Already Production-Ready

| Component | Status | Notes |
|-----------|--------|-------|
| **Build config** | ✅ | `output: 'standalone'` configured in `next.config.js` |
| **Authentication** | ✅ | `trustHost: true` enabled, middleware handles proxy headers |
| **Environment variables** | ✅ | `.env.example` pattern, no secrets in code |
| **Database** | ✅ | SQLite works on VPS with persistent filesystem |
| **Image uploads** | ✅ | Local filesystem works on VPS |
| **Dev-only code** | ✅ | Prisma Studio link gated by `NODE_ENV === 'development'` |

### ⚠️ Considerations for This Setup

**SQLite on VPS:**
- Works perfectly for a personal blog
- Single-writer model (no concurrent writes from multiple servers)
- Database file at `/var/www/blog/prisma/prod.db`
- **Must back up** this file regularly

**Local Image Storage:**
- Images stored at `/var/www/blog/public/uploads/`
- Persists across deploys (unlike serverless)
- **Must back up** this directory regularly

**Rate Limiting:**
- Currently none on API routes
- Cloudflare provides DDoS protection at the edge
- For additional protection, can add Caddy rate limiting or app-level middleware

### Security Hardening (Optional)

Add to `next.config.js` for security headers:

```javascript
const nextConfig = {
  output: 'standalone',
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
  // ... rest of config
}
```

---

## Backup Strategy

### Database Backup

Create `/var/www/blog/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/blog"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/blog/prisma/prod.db "$BACKUP_DIR/prod_$TIMESTAMP.db"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /var/www/blog/public uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

Make executable and add to cron:

```bash
chmod +x /var/www/blog/backup.sh

# Add to crontab (runs daily at 2am)
crontab -e
# Add this line:
0 2 * * * /var/www/blog/backup.sh >> /var/log/blog-backup.log 2>&1
```

### Off-site Backup (Optional)

For critical data, sync backups to external storage:

```bash
# Example: rsync to another server
rsync -avz /var/backups/blog/ user@backup-server:/backups/blog/

# Example: upload to S3/R2
aws s3 sync /var/backups/blog/ s3://your-bucket/blog-backups/
```

---

## Production Checklist

### Pre-Deployment

- [ ] Create DigitalOcean droplet (Ubuntu 24.04, $6/month)
- [ ] Install Node.js 20, PM2, and Caddy on server
- [ ] Clone repo, install deps, configure `.env`, build app
- [ ] Start app with PM2 and enable startup on boot
- [ ] Configure Caddy with hunterrosenblume.com + 4 alias redirects

### DNS & CDN

- [ ] Add hunterrosenblume.com to Cloudflare, configure DNS and SSL
- [ ] Add hunterr.net to Cloudflare, configure DNS and SSL
- [ ] Add hrosenblume.com to Cloudflare, configure DNS and SSL
- [ ] Add hunterosenblu.me to Cloudflare, configure DNS and SSL
- [ ] Add hunterr.org to Cloudflare, configure DNS and SSL
- [ ] Set SSL mode to "Full (strict)" for all domains
- [ ] Enable "Always Use HTTPS" for all domains

### Authentication

- [ ] Update Google OAuth redirect URI for hunterrosenblume.com
- [ ] Verify `NEXTAUTH_URL` is `https://hunterrosenblume.com`
- [ ] Verify `NEXTAUTH_SECRET` is set (not the dev value)
- [ ] Test sign-in flow works correctly

### Verification

- [ ] Test hunterrosenblume.com routes and authentication flow
- [ ] Test all 4 alias domains redirect to hunterrosenblume.com
- [ ] Test essay creation and publishing
- [ ] Test image upload functionality
- [ ] Verify dark mode works correctly

### Backups & Monitoring

- [ ] Set up backup script with cron job
- [ ] Verify backups are being created
- [ ] (Optional) Set up off-site backup sync
- [ ] (Optional) Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] (Optional) Set up error tracking (Sentry)

### Security (Optional but Recommended)

- [ ] Add security headers to `next.config.js`
- [ ] Enable Cloudflare firewall rules if needed
- [ ] Set up SSH key authentication (disable password auth)
- [ ] Configure UFW firewall on droplet (allow 22, 80, 443 only)

### Post-Launch

- [ ] Monitor PM2 logs for errors: `pm2 logs blog`
- [ ] Check Cloudflare analytics for traffic patterns
- [ ] Verify backups are running daily

