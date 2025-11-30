import { NextRequest, NextResponse } from 'next/server'
import { requireSession, unauthorized, badRequest } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
const MAX_SIZE = 4 * 1024 * 1024 // 4MB

export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (!session) return unauthorized()

  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) return badRequest('No image provided')
  if (file.size > MAX_SIZE) return badRequest('File too large (max 4MB)')
  if (!VALID_TYPES.includes(file.type as typeof VALID_TYPES[number])) return badRequest('Invalid file type')

  const ext = file.name.split('.').pop()
  const filename = `${randomUUID()}.${ext}`
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${filename}` })
}
