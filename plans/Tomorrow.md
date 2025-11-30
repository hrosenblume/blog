# Launch Checklist

## 1. Write Essays

- [ ] Write first essay
- [ ] Write second essay  
- [ ] Review and publish both

## 2. Deploy

Follow [buildfor.plan.md](buildfor.plan.md) for detailed steps:

- [ ] Create DigitalOcean droplet ($6/month, Ubuntu 24.04)
- [ ] Install Node.js 20, PM2, Caddy
- [ ] Clone repo, configure `.env`, build app
- [ ] Start with PM2, configure Caddy reverse proxy
- [ ] Add domain to Cloudflare, configure DNS
- [ ] Update Google OAuth redirect URI for production domain
- [ ] Test full flow: homepage, login, writer dashboard, publish

## 3. Go Live

- [ ] Final review of published essays
- [ ] Share the link
