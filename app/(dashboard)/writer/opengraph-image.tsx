import { ImageResponse } from 'next/og'
import { HOMEPAGE } from '@/lib/homepage'
import { OG_SIZE, OG_CONTENT_TYPE, OG_FONT_FAMILY } from '@/lib/metadata'

export const runtime = 'edge'
export const alt = 'Writer Dashboard'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

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
          background: '#f5f5f5',
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: '#000' }}>
          {HOMEPAGE.name}
        </div>
        <div style={{ fontSize: 32, color: '#666', marginTop: 16 }}>
          Writer Dashboard
        </div>
      </div>
    ),
    { ...size }
  )
}

