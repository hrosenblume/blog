# Tap Essay Polyhedron → Spin Fast & Animate Into Essay

## Goal
Create a delightful interaction where tapping an essay's polyhedron causes it to spin rapidly and animate/transition into the essay page.

## Current Behavior
- Polyhedra rotate slowly on hover
- Clicking navigates directly to essay
- No special transition animation

## Proposed Solution

### Phase 1: Fast Spin on Tap

#### 1.1 Add Click Handler to PolyhedraCanvas

```tsx
// components/PolyhedraCanvas.tsx
interface Props {
  // existing props...
  onClick?: () => void
  onAnimationComplete?: () => void
}

export function PolyhedraCanvas({ onClick, onAnimationComplete, ...props }: Props) {
  const [isSpinning, setIsSpinning] = useState(false)
  
  const handleClick = () => {
    setIsSpinning(true)
    // Spin for 500ms then trigger navigation
    setTimeout(() => {
      onAnimationComplete?.()
    }, 500)
    onClick?.()
  }
  
  // Modify rotation speed based on isSpinning
  const rotationSpeed = isSpinning ? 0.1 : isHovered ? 0.375 : 4 // seconds per rotation
}
```

#### 1.2 Exponential Speedup Animation
Instead of instant fast spin, accelerate smoothly:

```tsx
const [spinMultiplier, setSpinMultiplier] = useState(1)

const handleClick = () => {
  // Animate from 1x to 20x speed over 400ms
  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / 400, 1)
    // Exponential easing
    setSpinMultiplier(1 + (19 * Math.pow(progress, 2)))
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      onAnimationComplete?.()
    }
  }
  requestAnimationFrame(animate)
}
```

### Phase 2: Animate Into Essay Page

#### 2.1 Shared Layout Animation (View Transitions API)
Use the View Transitions API for smooth cross-page animation:

```tsx
// In essay list item
<Link 
  href={`/e/${slug}`}
  onClick={(e) => {
    if (!document.startViewTransition) return
    e.preventDefault()
    
    document.startViewTransition(() => {
      router.push(`/e/${slug}`)
    })
  }}
>
  <PolyhedraCanvas 
    style={{ viewTransitionName: `polyhedra-${slug}` }}
  />
</Link>

// In essay page
<PolyhedraCanvas 
  style={{ viewTransitionName: `polyhedra-${slug}` }}
/>
```

#### 2.2 CSS for View Transition

```css
/* In globals.css */
::view-transition-old(polyhedra-*),
::view-transition-new(polyhedra-*) {
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
}

::view-transition-old(polyhedra-*) {
  animation-name: scale-out;
}

::view-transition-new(polyhedra-*) {
  animation-name: scale-in;
}

@keyframes scale-out {
  to { transform: scale(1.5); opacity: 0; }
}

@keyframes scale-in {
  from { transform: scale(0.5); opacity: 0; }
}
```

#### 2.3 Fallback for Unsupported Browsers
If View Transitions not supported, use Framer Motion:

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Wrap polyhedra in motion component
<motion.div
  layoutId={`polyhedra-${slug}`}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  <PolyhedraCanvas />
</motion.div>
```

### Phase 3: Combined Flow

```tsx
// EssayLink.tsx or similar
export function EssayCard({ essay }: Props) {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  
  const handlePolyhedraClick = () => {
    setIsAnimating(true)
  }
  
  const handleAnimationComplete = () => {
    // Navigate after spin animation
    if (document.startViewTransition) {
      document.startViewTransition(() => router.push(`/e/${essay.slug}`))
    } else {
      router.push(`/e/${essay.slug}`)
    }
  }
  
  return (
    <div className="relative">
      <PolyhedraCanvas
        shape={essay.shape}
        onClick={handlePolyhedraClick}
        onAnimationComplete={handleAnimationComplete}
        isSpinning={isAnimating}
      />
      <Link href={`/e/${essay.slug}`}>
        <h2>{essay.title}</h2>
      </Link>
    </div>
  )
}
```

## Files to Modify
- `components/PolyhedraCanvas.tsx` - Add click handler and spin animation
- `components/EssayLink.tsx` - Integrate animation flow
- `app/e/[slug]/page.tsx` - Add matching view transition name
- `app/globals.css` - Add view transition CSS
- `app/page.tsx` - Update essay list to use new component

## Testing Checklist
- [ ] Tapping polyhedra triggers fast spin
- [ ] Spin animation is smooth and satisfying
- [ ] Navigation occurs after spin completes
- [ ] View transition animates polyhedra between pages (if supported)
- [ ] Fallback works in unsupported browsers
- [ ] No performance issues with animation
- [ ] Works on mobile (touch)
- [ ] Respects prefers-reduced-motion

## Reduced Motion Support

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Skip animation, navigate immediately
  router.push(`/e/${slug}`)
  return
}
```

## Browser Support
- View Transitions API: Chrome 111+, Edge 111+
- Safari: Not yet (use fallback)
- Firefox: Not yet (use fallback)

