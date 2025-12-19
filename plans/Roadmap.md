# Roadmap

## Now

*(Nothing active — pick from Soon)*

---

## Soon

### ✨ Polyhedra on Essay Pages

Add 3D shapes to essay pages (already assigned via `polyhedraShape`).

**Consider:** Placement (header/sidebar/corner), smaller size, scroll performance, mobile/reduced-motion.

---

### 🎨 View All Essays Link

"View all essays →" feels disconnected. Options:
- Inline with "Recent Essays" header
- Card-style footer
- Final row in essay list
- Floating after scroll

---

## Later

### ✨ Voice-to-Essay

Long-press "+" on mobile → record → transcribe → generate draft.

**Flow:** Record → Whisper/Web Speech API → AI generation → Editor

**UX:** Pulsing feedback, vibration, preview before generate.

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

### ✨ Persistent Chat History

Save chat to DB, resume across sessions.

**Schema:** `ChatMessage` (userId, postId?, role, content, createdAt)

**Features:** Load previous messages, clear/archive, conversation grouping.

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


