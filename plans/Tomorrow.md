# Blog Launch Plan

A structured plan to prepare the blog for production launch, covering editor improvements, security hardening, design polish, polyhedra enhancements, and deployment.

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

### 1.3 Fix Editor Layout and Views
Current editor has single edit/preview toggle. Improvements needed:
- Split-pane view (edit left, preview right)
- Full-screen edit mode
- Full-screen preview mode
- Better textarea styling with line numbers (optional)

### 1.4 Implement Auto-save
Current: Basic 3-second debounce exists but only for drafts. Enhance:
- Visual indicator showing save status
- Conflict detection if editing from multiple tabs
- Recover unsaved changes from localStorage on page reload

### 1.5 Implement Revisions UI
Schema already has `Revision` model. Build out:
- Revision history sidebar in editor
- Diff view between revisions
- Restore from revision functionality
- Currently `app/admin/revisions/page.tsx` is read-only

---

## Phase 2: Security Hardening

### 2.1 Input Validation and Sanitization
- Add Zod schemas for all API inputs
- Validate slug format (alphanumeric, hyphens only)
- Limit markdown size (prevent DoS)
- Rate limit API endpoints

### 2.2 Authentication Hardening
Current auth in `lib/auth.ts` is solid. Additional measures:
- Add CSRF protection
- Implement session rotation
- Add audit logging for admin actions

### 2.3 Content Security
- Review `sanitize-html` config for XSS vectors
- Add Content Security Policy headers
- Validate image uploads (type, size limits)

### 2.4 API Route Audit
Review all routes in `app/api/`:
- Ensure all mutations require authentication
- Verify admin-only routes check role properly
- Add proper error handling (don't leak stack traces)

---

## Phase 3: Design Polish

### 3.1 Homepage Improvements
Current homepage (`app/page.tsx`) is minimal. Enhance:
- Better typography (consider a distinctive serif for headings)
- Animated entrance for essay list
- Improved hover states on essay cards
- Add reading time estimates
- Consider featured/pinned essays section

### 3.2 Mobile Responsiveness
Test and fix:
- Editor usability on mobile (toolbar collapse, touch-friendly)
- Essay page reading experience
- Homepage layout on small screens
- Navigation/menu for mobile

### 3.3 Global CSS Polish
Update `app/globals.css`:
- Refine prose typography
- Add print styles for essays
- Improve focus states for accessibility

---

## Phase 4: Polyhedra Enhancements

### 4.1 Fix Vertex Visibility
In `lib/polyhedra/renderer.ts`, the `drawVertexSphere` function draws vertices at a fixed radius. Options:
- Reduce vertex radius (currently `size / 35`)
- Match vertex color to edge color at that point
- Remove vertices entirely and rely on edge overlaps
- Add subtle gradient/glow instead of solid dots

### 4.2 Build dmccooey.com API Scraper
The site at https://dmccooey.com/polyhedra/ has hundreds of shapes. Create:
- Script to fetch and parse OFF files from the site
- Add to `scripts/polyhedra/` directory
- Integrate new shapes into build pipeline
- Consider caching downloaded data

---

## Phase 5: Production Preparation

### 5.1 Environment Setup
- Create `.env.production` template
- Document required environment variables
- Set up production database (migrate from SQLite to PostgreSQL recommended)

### 5.2 Code Cleanup
- Remove console.logs and debug code
- Ensure consistent code style (run Prettier/ESLint)
- Add JSDoc comments to key functions
- Review and update README

### 5.3 Performance Optimization
- Add proper caching headers
- Optimize images (if any)
- Review bundle size
- Add loading skeletons where needed

### 5.4 Add Real Essays
- Create 2-3 initial essays to launch with
- Test full publish flow end-to-end

---

## Phase 6: Deployment

### 6.1 Choose Hosting
Options:
- Vercel (easiest for Next.js)
- Railway/Render (if need persistent SQLite or PostgreSQL)
- Self-hosted VPS

### 6.2 CI/CD Setup
- GitHub Actions for automated deployment
- Run tests before deploy
- Preview deployments for PRs

### 6.3 DNS and Domain
- Configure custom domain
- Set up SSL
- Configure redirects (www to non-www or vice versa)

### 6.4 Monitoring
- Set up error tracking (Sentry)
- Add basic analytics
- Monitor uptime

---

## Task Checklist

- [ ] Re-implement font/style formatting toolbar in Editor
- [ ] Fix markdown implementation with syntax highlighting
- [ ] Fix editor layout with split-pane and full-screen modes
- [ ] Enhance auto-save with visual indicators and localStorage recovery
- [ ] Build revision history UI with diff view and restore
- [ ] Add Zod schemas and rate limiting to API routes
- [ ] Audit all API routes and add CSP headers
- [ ] Improve homepage typography, animations, and layout
- [ ] Test and fix mobile responsiveness across all pages
- [ ] Reduce vertex visibility in polyhedra renderer
- [ ] Build scraper for dmccooey.com polyhedra data
- [ ] Clean up code, add docs, ensure portfolio quality
- [ ] Add real essays and test publish flow
- [ ] Deploy to production with CI/CD and monitoring

