# Tomorrow

## Key Features

### Automated Draft Generation

Build a system where blog posts write themselves based on news/data sources, then queue up for human review and editing.

**Core flow:**
1. Background job fetches news, trends, or data from configured sources
2. AI generates a draft essay based on the content
3. Draft appears in a "Review Queue" in the writer dashboard
4. I review, edit (using existing editor), and publish — or discard

**Components needed:**
- [ ] News/data source integrations (RSS feeds, APIs, etc.)
- [ ] Background job scheduler (cron or on-demand trigger)
- [ ] "pending_review" post status (between draft and published)
- [ ] Review queue UI in writer dashboard
- [ ] Quick approve/discard actions
- [ ] Source attribution/linking in generated drafts

**Design considerations:**
- Should feel like posts are "coming in" rather than me creating them
- Keep full editorial control — nothing publishes without my approval
- Track which sources/topics generated which drafts
- Could eventually add topic preferences or source priorities

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
