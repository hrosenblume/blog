# Roadmap

## Now

Active work — what I'm building next.

*(Nothing active — pick something from Soon!)*

---

## Soon

Queued up, scoped, ready to build when Now is done.

### Mobile Editor Rotation/Zoom Bug

When rotating the device while in the editor, improper zoom behavior occurs. The viewport zooms in unexpectedly instead of handling orientation changes gracefully.

**Issues:**
- Rotating from portrait to landscape (or vice versa) triggers unwanted zoom
- Editor content becomes improperly scaled after rotation
- Need to prevent browser zoom responses during orientation change

**Possible fixes:**
- Investigate `viewport` meta tag settings for `user-scalable` and `maximum-scale`
- Check if Tiptap editor has conflicting touch/zoom handlers
- May need to listen for `orientationchange` events and reset viewport
- Consider `touch-action` CSS properties on editor container

---

### Standardize Light/Dark Mode Toggle Placement

The theme toggle lives in different places across the site. Need to decide on a consistent location and implement it everywhere.

**Audit needed:**
- Where does the toggle currently appear?
- Should it be in the navbar, footer, or a fixed corner position?
- Consider keyboard shortcut (`Cmd + .`) as primary and toggle as secondary

---

### Standardize Navbar Behavior

Navbar behavior varies across different sections of the site. Create a consistent navigation experience.

**Things to standardize:**
- Sticky vs static behavior
- Mobile menu/hamburger patterns
- Back button vs logo/home link
- Active state indicators
- Transition animations

---

### Admin Panel Bottom White Bar Bug

Fix the unwanted white bar/space that appears at the bottom of the admin panel. Likely a layout or overflow issue.

**Investigate:**
- Check if it's a `min-height` vs `height` issue on the layout container
- Could be body/html background color showing through
- May be related to mobile viewport height (`100vh` vs `100dvh`)
- Check for extra margin/padding on the last element

---

### Spinning Polyhedra on Essay Pages

Add the animated 3D polyhedra to individual essay pages. Currently they only appear on the homepage — extending this to essay pages would create visual continuity and make each essay feel more distinctive (each essay already has an assigned `polyhedraShape`).

**Considerations:**
- Placement: header area, sidebar, or floating corner element
- Size: smaller than homepage to not distract from reading
- Performance: ensure canvas doesn't impact scroll performance
- Mobile: may want to hide or reduce motion on smaller screens

---

### View All Essays Button Integration

The "View all essays →" link on the homepage feels disconnected. Options:
- **A. Inline with section header** — Move next to "Recent Essays" as a right-aligned link
- **B. Card-style footer** — Style it as a subtle card matching essay links
- **C. After last essay** — Add as a final "row" in the essay list with different styling
- **D. Floating/sticky** — Show as floating button after scrolling past essays

---

## Later

Ideas worth keeping — someday/maybe.

### Voice-to-Essay on Mobile

Hold down the "+" button on mobile to record a voice memo, then generate an essay from what you said. Quick capture for ideas on the go.

**Flow:**
- Long-press on new post button triggers recording mode
- Visual feedback (pulsing, waveform) while recording
- Release to stop recording
- Transcribe audio → pass to AI → generate draft essay
- Opens in editor for review/editing

**Technical considerations:**
- Web Speech API or Whisper API for transcription
- May need to handle permissions gracefully
- Consider upload to server vs client-side transcription
- Fallback for browsers without audio support

**UX ideas:**
- Drag gesture (hold + drag out) could feel natural
- Short vibration feedback on start/stop
- Preview transcription before generating essay
- Could also work as a quick-add to existing essay

---

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

---

### Chat-to-Essay Integration

Make the AI chat panel more actionable — not just brainstorming, but actually updating the essay.

**Copy/paste improvements:**
- One-click copy button on chat responses
- "Insert into essay" action that appends/replaces content
- Code block or quote formatting for easy extraction

**Direct essay updates from chat:**
- Chat commands like "update the intro to say X" or "remove the second paragraph"
- AI parses intent and proposes changes as a diff/preview
- Accept/reject individual changes before applying
- Could use structured tool calls to modify markdown

**Design considerations:**
- Keep it conversational — shouldn't feel like a command line
- Show clear previews before any destructive changes
- Maybe a "suggested edit" inline in the essay with accept/reject
- Consider undo/revision integration so changes are reversible

