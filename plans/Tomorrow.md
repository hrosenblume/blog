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

---

## Minor Changes

### View All Essays Button Integration
The "View all essays →" link on the homepage feels disconnected. Options:
- **A. Inline with section header** — Move next to "Recent Essays" as a right-aligned link
- **B. Card-style footer** — Style it as a subtle card matching essay links
- **C. After last essay** — Add as a final "row" in the essay list with different styling
- **D. Floating/sticky** — Show as floating button after scrolling past essays

### Other Polish
- [ ] TBD — add more minor changes here
