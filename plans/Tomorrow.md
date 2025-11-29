# Blog Launch Plan

A structured plan to prepare the blog for production launch.

---

## Phase 1: Core Editor Functionality

### 1.1 Re-implement Font/Style Bar
Add a formatting toolbar to the editor in `app/writer/editor/[[...slug]]/page.tsx`:
- Bold, italic, strikethrough buttons
- Heading levels (H1, H2, H3)
- Link insertion
- Code block / inline code
- Blockquote
- Lists (ordered/unordered)

Implementation: Create a `FormatToolbar` component that wraps selection with markdown syntax.

### 1.2 Fix Markdown Implementation
Update `lib/markdown.ts`:
- Add syntax highlighting for code blocks (use `highlight.js` or `prism`)
- Ensure all HTML tags render properly (tables, footnotes)
- Fix any sanitization issues blocking valid content

### 1.3 Auto-save Revisions
Each time a draft is saved, create a revision in the database. The `Revision` model already exists in the schema - just ensure every save creates a new revision entry.

---

## Phase 2: Design Polish

### 2.1 Homepage Improvements
Current homepage (`app/page.tsx`) is minimal. Enhance:
- Better typography (consider a distinctive serif for headings)
- Animated entrance for essay list
- Improved hover states on essay cards
- Add reading time estimates
- Consider featured/pinned essays section

### 2.2 Mobile Responsiveness
Test and fix:
- Editor usability on mobile (toolbar collapse, touch-friendly)
- Essay page reading experience
- Homepage layout on small screens
- Navigation/menu for mobile

### 2.3 Global CSS Polish
Update `app/globals.css`:
- Refine prose typography
- Add print styles for essays
- Improve focus states for accessibility

---

## Phase 3: Polyhedra Enhancements

### 3.1 Fix Vertex Visibility
In `lib/polyhedra/renderer.ts`, the `drawVertexSphere` function draws vertices at a fixed radius. Options:
- Reduce vertex radius (currently `size / 35`)
- Match vertex color to edge color at that point
- Remove vertices entirely and rely on edge overlaps
- Add subtle gradient/glow instead of solid dots

### 3.2 Build dmccooey.com API Scraper
The site at https://dmccooey.com/polyhedra/ has hundreds of shapes. Create:
- Script to fetch and parse OFF files from the site
- Add to `scripts/polyhedra/` directory
- Integrate new shapes into build pipeline
- Consider caching downloaded data

---

## Phase 4: Production Preparation

### 4.1 Code Cleanup
- Remove console.logs and debug code
- Ensure consistent code style (run Prettier/ESLint)
- Review and update README

### 4.2 Add Real Essays
- Create 2-3 initial essays to launch with
- Test full publish flow end-to-end

---

## Phase 5: Deployment

Deploy to DigitalOcean with Cloudflare CDN per [`buildfor.plan.md`](buildfor.plan.md):

1. Create $6/month DigitalOcean droplet (Ubuntu 24.04)
2. Install Node.js 20, PM2, Caddy
3. Clone repo, configure `.env`, build app
4. Start with PM2, configure Caddy reverse proxy
5. Add domain to Cloudflare, configure DNS and SSL
6. Update Google OAuth redirect URI

---

## Task Checklist

- [ ] Re-implement font/style formatting toolbar in Editor
- [ ] Fix markdown implementation with syntax highlighting
- [ ] Ensure draft saves create revisions in database
- [ ] Improve homepage typography, animations, and layout
- [ ] Test and fix mobile responsiveness across all pages
- [ ] Reduce vertex visibility in polyhedra renderer
- [ ] Build scraper for dmccooey.com polyhedra data
- [ ] Clean up code and README
- [ ] Add real essays and test publish flow
- [ ] Deploy to DigitalOcean with Cloudflare (see buildfor.plan.md)
