import { ImageResponse } from 'next/og'
import { HOMEPAGE } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          background: '#fff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: '#000' }}>
          {HOMEPAGE.name}
        </div>
        <div style={{ fontSize: 36, color: '#666', marginTop: 16 }}>
          Essays
        </div>
      </div>
    ),
    { ...size }
  )
}

