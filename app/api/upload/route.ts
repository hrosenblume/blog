import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { uploadFile } from '@/lib/storage'

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
const MAX_SIZE = 4 * 1024 * 1024 // 4MB

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    if (!session) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) return badRequest('No image provided')
    if (file.size > MAX_SIZE) {
      return badRequest(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 4MB.`)
    }
    if (!VALID_TYPES.includes(file.type as typeof VALID_TYPES[number])) {
      return badRequest(`Invalid file type: ${file.type}. Supported types: JPEG, PNG, GIF, WebP.`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type)

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    )
  }
}
