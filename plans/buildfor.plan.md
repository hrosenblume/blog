<!-- f0b8253c-fd62-40e7-b8fd-4c245666368e 5c8be652-67cc-4f28-bcce-6e303d8ce928 -->
# Deploy to DigitalOcean with Cloudflare CDN

This plan deploys your blog to a $6/month DigitalOcean droplet with Cloudflare in front for CDN, DDoS protection, and edge caching. No code changes required - SQLite and file uploads work as-is.

---

## CURSOR INSTRUCTIONS: Required User Input

**CRITICAL FOR CURSOR:** Before executing ANY phase of this plan, you MUST use the `ask_question` tool to collect the following values from the user. Do NOT proceed without these answers. Do NOT guess or use placeholders. Ask all questions upfront before running any commands.

### Questions Cursor Must Ask (use ask_question tool)

1. **Domain:** "What is your domain name? (e.g., hunterrosenblume.com)"
2. **GitHub Repo:** "What is your GitHub repository URL? (e.g., https://github.com/username/blog.git)"
3. **Droplet IP:** "What is your DigitalOcean droplet IP address? (Create the droplet first per Phase 1, then provide the IP)"
4. **Google Client ID:** "What is your GOOGLE_CLIENT_ID from Google Cloud Console?"
5. **Google Client Secret:** "What is your GOOGLE_CLIENT_SECRET from Google Cloud Console?"
6. **NextAuth Secret:** "Do you have a NEXTAUTH_SECRET, or should I generate one? (I can run `openssl rand -base64 32` to generate one)"

### Variable Substitution

After collecting answers, substitute these placeholders throughout ALL commands:

| Variable | Description | Example |

|----------|-------------|---------|

| `DOMAIN` | Your domain name | `hunterrosenblume.com` |

| `DROPLET_IP` | DigitalOcean droplet IP (after creation) | `164.92.xxx.xxx` |

| `GITHUB_REPO` | Your GitHub repo URL | `https://github.com/user/blog.git` |

| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `xxx.apps.googleusercontent.com` |

| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-xxx` |

| `NEXTAUTH_SECRET` | Random 32+ char string | Generate with `openssl rand -base64 32` |

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
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
```

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
$DOMAIN {
    reverse_proxy localhost:3000
}
```

Restart Caddy:

```bash
systemctl restart caddy
systemctl status caddy  # Verify running
```

Caddy automatically provisions SSL certificates via Let's Encrypt.

---

## Phase 6: Cloudflare Setup (Manual - User Action)

**User must do this in Cloudflare dashboard:**

1. **Add Site**:

   - Go to cloudflare.com, add your domain
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

6. **Caching** (optional but recommended):

   - Go to Caching > Configuration
   - Set Browser Cache TTL to "Respect Existing Headers"

---

## Phase 7: Update Google OAuth (Manual - User Action)

**User must do this in Google Cloud Console:**

1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://$DOMAIN/api/auth/callback/google
   ```

4. Save changes

---

## Phase 8: Verify Deployment

Test these URLs:

- `https://$DOMAIN` - Public homepage
- `https://$DOMAIN/writer` - Should redirect to sign-in
- `https://$DOMAIN/admin` - Should redirect to sign-in
- Sign in with Google, verify auth works

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

| Cloudflare | Free |

| Domain (varies) | ~$12/year |

| **Total** | ~$7/month |

---

## Troubleshooting

**App not loading:**

```bash
pm2 logs blog --lines 50  # Check app logs
systemctl status caddy     # Check Caddy status
```

**SSL not working:**

- Ensure Cloudflare SSL is set to "Full (strict)"
- Check Caddy logs: `journalctl -u caddy`

**Auth not working:**

- Verify NEXTAUTH_URL matches your domain exactly (with https://)
- Verify Google OAuth redirect URI is correct
- Check `.env` file has correct values

**Database issues:**

```bash
cd /var/www/blog
npx prisma studio  # Opens database GUI on port 5555
```

### To-dos

- [ ] Create DigitalOcean droplet (Ubuntu 24.04, $6/month)
- [ ] Install Node.js 20, PM2, and Caddy on server
- [ ] Clone repo, install deps, configure .env, build app
- [ ] Start app with PM2 and enable startup on boot
- [ ] Configure Caddy reverse proxy with domain
- [ ] Add domain to Cloudflare, configure DNS and SSL
- [ ] Update Google OAuth redirect URI for production domain
- [ ] Test all routes and authentication flow

