import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'
import { HOMEPAGE } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Essay preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Note: Edge runtime can't use Prisma directly, so we fetch via API or use a simpler approach
  // For now, just show the title from the slug
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          background: '#fff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#000',
            lineHeight: 1.2,
            textAlign: 'center',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: '#666' }}>
          {HOMEPAGE.name}
        </div>
      </div>
    ),
    { ...size }
  )
}

