import { ImageResponse } from 'next/og'
import { HOMEPAGE } from '@/lib/homepage'

export const runtime = 'edge'
export const alt = 'Admin'
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
          background: '#1a1a1a',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: '#fff' }}>
          {HOMEPAGE.name}
        </div>
        <div style={{ fontSize: 32, color: '#888', marginTop: 16 }}>
          Admin
        </div>
      </div>
    ),
    { ...size }
  )
}

