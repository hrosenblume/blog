# Roadmap

## Now

*(Nothing active — pick from Later)*

---

## Recently Completed

### ✅ Mobile Touch/Chat Bugs
- [x] Writer navbar buttons stop responding → added `type="button"` and `touch-manipulation`
- [x] Chat window scrolls to top on open/close → scroll to bottom on open
- [x] Globe icon triggers send on mobile → fixed ControlButton type
- [x] Message input blocked during loading → removed disabled state from textarea

### ✅ AI/Web Search
- [x] Web search not working → switched to OpenAI Responses API
- [x] OpenAI models returning errors → fixed `max_completion_tokens` param
- [x] Claude web search → 2-call flow with GPT fetching results first

### ✅ Revision History
- [x] Missing restore button → added Restore/Cancel buttons to preview banner

### ✅ Settings Navigation
- [x] Remove Admin badge → navbar now shows "Settings" on admin pages

---

## Later

### ✨ Polyhedra on Essay Pages

Add 3D shapes to essay pages (already assigned via `polyhedraShape`).

**Consider:** Placement (header/sidebar/corner), smaller size, scroll performance, mobile/reduced-motion.

---

### ✨ Select Investments Section

Homepage section showcasing portfolio companies.

**Display:** Logo grid, company name, description, link. Grayscale → color on hover.

---

### ✨ Custom Homepage Essay Order

Manual control over homepage essays instead of most recent.

**Options:** Featured toggle per essay, or drag-and-drop in admin.

---

### ✨ RSS + Email Subscription

- RSS at `/feed.xml` with autodiscovery
- Email via Buttondown/Mailchimp
- Subscribe form in footer

---

### 🎨 Visual Bio Section

Make homepage bio more engaging. Keep minimal aesthetic, respect motion preferences.

---

### ✨ User Contacts / CRM Lite

Personal contact list in writer dashboard.

**Schema:** `Contact` (userId, name, email, company, notes, tags)

**Features:** Search/filter, link to essays, import from LinkedIn/CSV.

---

### ✨ Social Post Generator from Essays

Generate social media posts from published essays for Twitter/X and LinkedIn.

**UI:** Button on essay page or in writer dashboard → modal with format picker → generated content → copy to clipboard.

**Formats:**
- **Tweet:** Single tweet (key insight or hook)
- **Thread:** Essay summary in 3-5 tweets
- **LinkedIn:** Longer-form post with hooks, line breaks, engagement-style formatting

**Features:**
- Tone options: professional, casual, provocative
- Edit before copying
- Character count indicators
- Uses existing AI system (`lib/ai/`) with platform-specific prompts

---

### ✨ Scalable Research Flows

Context stitching and smart essay building — ways to gather, organize, and synthesize research into coherent essays.

**Sources:**
- Twitter/X accounts I follow (trends, conversations, hot takes)
- RSS feeds, newsletters, articles
- Manual snippets and notes

**Ideas:**
- Aggregate content from multiple sources into a research pool
- Surface essay ideas based on trends and what people are talking about
- Save and tag research snippets/sources
- Link related sources together
- AI-assisted outlining from collected research
- Smart context injection when generating essays

---

### ✨ Inline Comments on Large Screens

Show comments alongside highlighted text on larger screens (side panel or margin annotations), instead of requiring users to open the comments panel.

