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

## 3. Minor Improvements

- [ ] Back button behavior in browser (navigating away from drafts, unsaved changes warnings, etc.)
- [ ] Larger dropdowns on mobile
- [ ] Home button on essays should have a larger click area
- [ ] Essay editor: hide word count (mental clutter)
- [ ] Make light/dark button in footer larger on mobile
- [ ] Tap essay polyhedron → spin super fast and animate into the essay page
- [ ] Switch to shadcn/ui for admin components (reduce boilerplate, consistent styling)
- [ ] Add sitemap.xml and SEO basics (meta tags, Open Graph, robots.txt)
- [ ] Social share previews (OG images, Twitter cards)
- [ ] "View all essays" link on homepage (and optionally on each essay page)
- [ ] Essay page date format: no date, or custom "written X / posted Y" format
- [ ] Custom control over homepage "recent essays" order and selection
- [ ] Subscription option: RSS feed + simple email (Buttondown/Mailchimp, low maintenance)
- [ ] Essays should be in infinite loop (navigating past last essay wraps to first)
- [ ] Mobile: regen shapes with long names breaks layout
- [ ] Admin doesn't work on mobile — need smarter build with less code (programmatic) or mobile app
- [ ] shadcn/ui for component library to simplify
- [ ] Remove Prisma — no use for it in this project. Clean up all references in dropdowns, etc.

## 4. Go Live

- [ ] Final review of published essays
- [ ] Share the link
