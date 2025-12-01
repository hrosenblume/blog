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

## Required User Input

**CRITICAL FOR CURSOR:** Before executing ANY phase of this plan, collect these values from the user:

1. **GitHub Repo:** Your GitHub repository URL (e.g., `https://github.com/username/blog.git`)
2. **Droplet IP:** DigitalOcean droplet IP address (after creation)
3. **Google Client ID:** From Google Cloud Console
4. **Google Client Secret:** From Google Cloud Console
5. **NextAuth Secret:** Random 32+ char string (generate with `openssl rand -base64 32`)

| Variable | Value |
|----------|-------|
| `DROPLET_IP` | DigitalOcean droplet IP (after creation) |
| `GITHUB_REPO` | Your GitHub repo URL (main blog code) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `GITHUB_BACKUP_REPO` | Private repo for essay backups (optional) |
| `GITHUB_BACKUP_TOKEN` | Fine-grained PAT with Contents read/write (optional) |

---

## Phase 1: Create DigitalOcean Droplet

**User must do this in DigitalOcean dashboard:**

1. Create Droplet:
   - **Image**: Ubuntu 24.04 LTS
   - **Size**: Basic $6/month (1GB RAM, 1 vCPU)
   - **Region**: Choose closest to your audience
   - **Authentication**: Add SSH key (recommended) or use password
   - **Hostname**: `blog`

2. Note the **Droplet IP** once created.

---

## Phase 2: Server Configuration

SSH into the droplet and run:

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

# Optional: GitHub backup for human-readable essay export
GITHUB_BACKUP_REPO="https://github.com/yourusername/essays-backup.git"
GITHUB_BACKUP_TOKEN="github_pat_xxxx..."
```

**Important:** `NEXTAUTH_URL` must be `https://hunterrosenblume.com` (the primary domain).

Initialize database and build:

```bash
npx prisma db push
npm run db:seed
mkdir -p public/uploads
npm run build
```

---

## Phase 4: Start Application with PM2

```bash
cd /var/www/blog
pm2 start npm --name "blog" -- start
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
hunterrosenblume.com {
    reverse_proxy localhost:3000
}

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

Restart Caddy:

```bash
systemctl restart caddy
systemctl status caddy
```

Caddy automatically provisions SSL certificates via Let's Encrypt.

---

## Phase 6: Cloudflare Setup

**For ALL 5 domains** (`hunterrosenblume.com`, `hunterr.net`, `hrosenblume.com`, `hunterosenblu.me`, `hunterr.org`):

1. Add site to Cloudflare
2. Update nameservers at registrar
3. Add A record: `@` → `$DROPLET_IP` (Proxied)
4. SSL/TLS → Set to "Full (strict)"
5. Edge Certificates → Enable "Always Use HTTPS"

---

## Phase 7: Update Google OAuth

In Google Cloud Console → APIs & Services → Credentials:

Add to **Authorized redirect URIs**:
```
https://hunterrosenblume.com/api/auth/callback/google
```

---

## Phase 8: Verify Deployment

Test primary domain:
- `https://hunterrosenblume.com` - Public homepage
- `https://hunterrosenblume.com/writer` - Should redirect to sign-in
- Sign in with Google, verify auth works

Test alias domains redirect to `hunterrosenblume.com`.

---

## Ongoing Deployments

```bash
cd /var/www/blog
git pull
npm install
npm run build
pm2 restart blog
```

Or create `/var/www/blog/deploy.sh`:

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

## Costs

| Service | Monthly Cost |
|---------|--------------|
| DigitalOcean Droplet (1GB) | $6 |
| Cloudflare (all domains) | Free |
| Domains | ~$12/year each |
| **Total** | ~$7/month + domain costs |

---

## Troubleshooting

**App not loading:**
```bash
pm2 logs blog --lines 50
systemctl status caddy
```

**SSL not working:**
- Ensure Cloudflare SSL is "Full (strict)" for all domains
- Check Caddy logs: `journalctl -u caddy`

**Auth not working:**
- Verify NEXTAUTH_URL is `https://hunterrosenblume.com`
- Verify Google OAuth redirect URI matches
- Check `.env` file values

**Database issues:**
```bash
npx prisma studio  # Opens database GUI
```

---

## Production Readiness

| Component | Status | Notes |
|-----------|--------|-------|
| Build config | ✅ | `output: 'standalone'` in `next.config.js` |
| Authentication | ✅ | `trustHost: true`, middleware handles proxy headers |
| Environment variables | ✅ | `.env.example` pattern, no secrets in code |
| Database | ✅ | SQLite works on VPS with persistent filesystem |
| Image uploads | ✅ | Local filesystem works on VPS |

### Security Hardening (Optional)

Add to `next.config.js`:

```javascript
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
],
```

---

## Backup Strategy

You have three backup options. **Recommendation:** Use Litestream + GitHub Export together.

| Method | What | Frequency | Cost | Survives Everything? |
|--------|------|-----------|------|----------------------|
| **Cron Script** | DB + uploads | Daily | Free (local) | No |
| **Litestream** | Database | Real-time | S3/R2 costs | No |
| **GitHub Export** | Essays as markdown | On publish | Free | Yes |

### Option 1: Cron Backup (Simple)

Create `/var/www/blog/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/blog"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/www/blog/prisma/prod.db "$BACKUP_DIR/prod_$TIMESTAMP.db"
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /var/www/blog/public uploads
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

Add to crontab (runs daily at 2am):
```bash
chmod +x /var/www/blog/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/blog/backup.sh >> /var/log/blog-backup.log 2>&1
```

### Option 2: Litestream (Real-Time)

Litestream continuously streams database changes to cloud storage with point-in-time recovery.

**Install:**
```bash
wget https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.deb
sudo dpkg -i litestream-v0.3.13-linux-amd64.deb
rm litestream-v0.3.13-linux-amd64.deb
```

**Create Cloudflare R2 bucket** (or AWS S3):
1. Cloudflare Dashboard → R2 → Create bucket (e.g., `blog-backups`)
2. Create API Token with read/write access
3. Note Access Key ID, Secret, and Account ID

**Configure** `/etc/litestream.yml`:

```yaml
dbs:
  - path: /var/www/blog/prisma/prod.db
    replicas:
      - type: s3
        bucket: blog-backups
        path: blog
        endpoint: https://<account-id>.r2.cloudflarestorage.com
        access-key-id: $LITESTREAM_ACCESS_KEY_ID
        secret-access-key: $LITESTREAM_SECRET_ACCESS_KEY
        force-path-style: true
```

**Create** `/etc/litestream.env`:
```bash
LITESTREAM_ACCESS_KEY_ID=your-access-key-id
LITESTREAM_SECRET_ACCESS_KEY=your-secret-access-key
```

**Create systemd service** `/etc/systemd/system/litestream.service`:

```ini
[Unit]
Description=Litestream SQLite Replication
After=network.target

[Service]
Type=simple
EnvironmentFile=/etc/litestream.env
ExecStart=/usr/bin/litestream replicate -config /etc/litestream.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Enable:**
```bash
sudo chmod 600 /etc/litestream.env
sudo systemctl daemon-reload
sudo systemctl enable litestream
sudo systemctl start litestream
```

**Restore** (when needed):
```bash
pm2 stop blog
litestream restore -config /etc/litestream.yml /var/www/blog/prisma/prod.db
pm2 start blog
```

### Option 3: GitHub Export (Human-Readable)

Export essays as markdown files to a private GitHub repo. **This survives even if you stop paying for everything.**

Each essay becomes a file like:
```markdown
---
title: "The Art of Simplicity"
slug: the-art-of-simplicity
status: published
createdAt: 2024-07-15T00:00:00.000Z
---

Your essay content here...
```

**Structure:**
```
essays-backup/
├── published/
│   └── the-art-of-simplicity.md
└── drafts/
    └── work-in-progress.md
```

**Setup:**
1. Create private repo on GitHub (e.g., `essays-backup`)
2. Generate Fine-grained PAT: https://github.com/settings/tokens
   - Repository access: Only your backup repo
   - Permissions: Contents → Read and write
3. Add to `.env`:
   ```env
   GITHUB_BACKUP_REPO=https://github.com/yourusername/essays-backup.git
   GITHUB_BACKUP_TOKEN=github_pat_xxxx...
   ```

**App features to build:**

| Component | Purpose |
|-----------|---------|
| `lib/export.ts` | Generate markdown with frontmatter |
| `app/api/export/github/route.ts` | Commit essays to GitHub |
| `app/api/export/zip/route.ts` | Download essays as ZIP |
| Export button in `/writer` | Trigger backup manually |

---

## Production Checklist

### Server Setup
- [ ] Create DigitalOcean droplet (Ubuntu 24.04, $6/month)
- [ ] Install Node.js 20, PM2, Caddy
- [ ] Clone repo, configure `.env`, build app
- [ ] Start with PM2, enable startup on boot
- [ ] Configure Caddy reverse proxy + redirects

### DNS & SSL
- [ ] Add all 5 domains to Cloudflare
- [ ] Configure A records pointing to droplet
- [ ] Set SSL to "Full (strict)" for all domains
- [ ] Enable "Always Use HTTPS"

### Authentication
- [ ] Update Google OAuth redirect URI
- [ ] Verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- [ ] Test sign-in flow

### Backups
- [ ] Set up Litestream with R2/S3 bucket
- [ ] Create private GitHub repo for essay export
- [ ] Configure export API routes and button
- [ ] Test both backup methods work

### Verification
- [ ] Test all routes and auth flow
- [ ] Test all alias domains redirect correctly
- [ ] Test essay creation, publishing, image uploads

### Post-Launch
- [ ] Monitor PM2 logs: `pm2 logs blog`
- [ ] Verify Litestream snapshots are recent
- [ ] Verify GitHub backup repo has commits
- [ ] Test restore procedure periodically
