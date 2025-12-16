# Roadmap

## Now

*(Nothing active — pick from Soon)*

---

## Soon

### 🐛 Chat Panel Inert Bug

Chat panel open + error = entire UI frozen. Toggle button is inside `inert` header.

| File | Issue |
|------|-------|
| `app/writer/layout.tsx` | Header/main get `inert={chatOpen}` |
| `components/ChatPanel.tsx:106` | Returns `null` if `!isVisible \|\| !mounted` |

**Fixes:** Move toggle outside inert container, or remove `inert` from header, or add error boundary.

---

### 🐛 Mobile Editor Rotation/Zoom

Device rotation triggers unwanted zoom in editor.

**Try:** `viewport` meta tag, `touch-action` CSS, `orientationchange` listener, Tiptap touch handlers.

---

### 🐛 Admin Panel Bottom White Bar

White space at bottom of admin panel.

**Check:** `min-height` vs `height`, body background, `100vh` vs `100dvh`, last element margin.

---

### 🎨 Standardize Theme Toggle Placement

Toggle appears in different places. Pick one: navbar, footer, or fixed corner. Keyboard shortcut (`Cmd + .`) is primary.

---

### 🎨 Standardize Navbar Behavior

Inconsistent across sections: sticky vs static, mobile menu, back button vs logo, active states, animations.

---

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

### ✨ Essay Tags / Categories

Organize essays by topic.

**Phase 1 (Admin/Writer):**
- CRUD tags in `/admin/tags`
- Assign in editor (multi-select)
- Show in writer dashboard

**Phase 2 (Public):**
- Display on essay pages
- Filter by tag
- Archive pages `/tag/[slug]`

**Schema:** `Tag` (id, name, slug, color?) ↔ `Post` (many-to-many)

---

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

### ✨ Chat-to-Essay Integration

Chat that can edit the essay, not just brainstorm.

**Features:**
- Copy button on responses
- "Insert into essay" action
- Commands: "update intro to X", "remove paragraph 2"
- Diff preview → accept/reject

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
