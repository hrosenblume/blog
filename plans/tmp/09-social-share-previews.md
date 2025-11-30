# Social Share Previews (OG Images, Twitter Cards)

## Goal
Generate beautiful, dynamic Open Graph images for essays to create compelling social media previews when links are shared.

## Options

### Option A: Static OG Images (Simple)
Create a template image and overlay text using a service.

### Option B: Dynamic OG Images with Next.js (Recommended)
Use Next.js's built-in `ImageResponse` API to generate images on-demand.

### Option C: External Service
Use Cloudinary, imgix, or similar for image generation.

## Recommended: Option B - Next.js ImageResponse

### 1. Create OG Image Route

Create `app/e/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import prisma from '@/lib/db'
import { homepage } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Essay preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const essay = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  })

  if (!essay) {
    return new ImageResponse(
      <div style={{ background: '#000', width: '100%', height: '100%' }} />,
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: 24,
            maxWidth: '90%',
          }}
        >
          {essay.title}
        </div>
        
        {/* Author */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {homepage.name}
        </div>
      </div>
    ),
    { ...size }
  )
}
```

### 2. Create Twitter Image Route

Create `app/e/[slug]/twitter-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import prisma from '@/lib/db'
import { homepage } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Essay preview'
export const size = { width: 1200, height: 600 } // Twitter aspect ratio
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const essay = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  })

  if (!essay) {
    return new ImageResponse(
      <div style={{ background: '#000', width: '100%', height: '100%' }} />,
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          background: '#0a0a0a',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {essay.title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#888',
            marginTop: 24,
          }}
        >
          by {homepage.name}
        </div>
      </div>
    ),
    { ...size }
  )
}
```

### 3. Add Custom Fonts

```tsx
import { ImageResponse } from 'next/og'

// Load font
const fontData = fetch(
  new URL('../../../public/fonts/Inter-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export default async function Image({ params }) {
  const font = await fontData

  return new ImageResponse(
    (/* JSX */),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: font,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
```

### 4. Include Polyhedra in OG Image (Advanced)

Render a static version of the essay's polyhedra:

```tsx
// Pre-render polyhedra as SVG or use canvas-to-image
// This is complex - may need to generate static PNGs of shapes

export default async function Image({ params }) {
  const essay = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, shape: true },
  })

  // Load pre-rendered shape image
  const shapeUrl = `${baseUrl}/polyhedra/${essay.shape}.png`

  return new ImageResponse(
    (
      <div style={{ /* ... */ }}>
        <img src={shapeUrl} width={200} height={200} />
        <div>{essay.title}</div>
      </div>
    ),
    { ...size }
  )
}
```

### 5. Default Site OG Image

Create `app/opengraph-image.tsx` for the homepage:

```tsx
import { ImageResponse } from 'next/og'
import { homepage } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
          }}
        >
          {homepage.name}
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 16,
          }}
        >
          Essays & Thoughts
        </div>
      </div>
    ),
    { ...size }
  )
}
```

## Files to Create
- `app/opengraph-image.tsx` - Homepage OG image
- `app/twitter-image.tsx` - Homepage Twitter image
- `app/e/[slug]/opengraph-image.tsx` - Essay OG images
- `app/e/[slug]/twitter-image.tsx` - Essay Twitter images
- `public/fonts/` - Custom fonts (if using)

## Testing Checklist
- [ ] OG images generate correctly for homepage
- [ ] OG images generate correctly for essays
- [ ] Images are correct size (1200x630 for OG, 1200x600 for Twitter)
- [ ] Text is readable and not cut off
- [ ] Images look good on Facebook
- [ ] Images look good on Twitter
- [ ] Images look good on LinkedIn
- [ ] Images look good on iMessage/SMS previews

## Validation Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [opengraph.xyz](https://www.opengraph.xyz/)

## Design Tips
- Use high contrast for readability
- Keep text concise (may be cropped)
- Include branding/author name
- Test on multiple platforms
- Consider dark/light versions

