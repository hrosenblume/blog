# Roadmap

## Now

Active work — what I'm building next.

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

## Soon

Queued up, scoped, ready to build when Now is done.

### View All Essays Button Integration

The "View all essays →" link on the homepage feels disconnected. Options:
- **A. Inline with section header** — Move next to "Recent Essays" as a right-aligned link
- **B. Card-style footer** — Style it as a subtle card matching essay links
- **C. After last essay** — Add as a final "row" in the essay list with different styling
- **D. Floating/sticky** — Show as floating button after scrolling past essays

---

## Later

Ideas worth keeping — someday/maybe.

### Select Investments Section

Add a new section to the homepage called "Select Investments" that showcases companies I've invested in.

**Features:**
- Company logos (consistent sizing, possibly grayscale with color on hover)
- Company name
- Short description of what the company does
- Links to company websites

**Design considerations:**
- Grid layout that works well on mobile and desktop
- Fits the minimal aesthetic of the rest of the site
- Consider a subtle hover effect for interactivity

---

### Custom Homepage Essay Order

Allow manual control over which essays appear on the homepage and in what order (instead of just showing most recent). Options include a "featured" toggle per essay or full drag-and-drop ordering in admin.

---

### RSS Feed + Email Subscription

Allow readers to subscribe to new essays:
- **RSS feed** at `/feed.xml` with autodiscovery
- **Email newsletter** via Buttondown or Mailchimp
- Subscribe form on homepage/footer

---

### Visual Bio Section

Transform the plaintext bio section on the homepage into something more visually engaging.

**Ideas:**
- None at this time

**Design considerations:**
- Keep the minimal aesthetic — enhance, don't overwhelm
- Ensure accessibility (motion preferences, contrast)
- Mobile-first approach
- Should feel cohesive with the 3D polyhedra and overall site vibe

