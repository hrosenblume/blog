import { NextRequest, NextResponse } from 'next/server'
import { appendFile } from 'fs/promises'
import { join } from 'path'

// Debug logging endpoint - writes to .cursor/debug.log
// Only active in development
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  try {
    const data = await request.json()
    const logLine = JSON.stringify({ ...data, timestamp: data.timestamp || Date.now() }) + '\n'
    const logPath = join(process.cwd(), '.cursor', 'debug.log')
    await appendFile(logPath, logLine)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Debug log error:', error)
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 })
  }
}
