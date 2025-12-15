import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { integrations } from '@/lib/integrations/config'

// Helper to capitalize first letter for hasXxx keys
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Build response object from settings using integrations config
// Checks both DB values and env var fallbacks
function buildResponse(settings: Record<string, unknown> | null): Record<string, boolean | string> {
  const response: Record<string, boolean | string> = {}
  for (const { key, inputType, envFallback } of integrations) {
    const dbValue = settings?.[key] as string | null | undefined
    const envValue = envFallback ? process.env[envFallback] : undefined
    const hasValue = !!(dbValue || envValue)
    const source = dbValue ? 'db' : envValue ? 'env' : null
    
    response[`has${capitalize(key)}`] = hasValue
    response[`${key}Source`] = source || ''
    // Only include actual values for non-password fields
    if (inputType !== 'password') {
      response[key] = dbValue || envValue || ''
    }
  }
  return response
}

// GET /api/integrations/settings - Get current integration settings
export const GET = withAdmin(async () => {
  const settings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' }
  })

  return NextResponse.json(buildResponse(settings))
})

// PATCH /api/integrations/settings - Update integration settings
export const PATCH = withAdmin(async (request: NextRequest) => {
  const body = await request.json()

  // Build update data dynamically from config
  const updateData: Record<string, string | null> = {}
  for (const { key } of integrations) {
    if (typeof body[key] === 'string') {
      // Empty string means clear the value
      updateData[key] = body[key] || null
    }
  }

  const settings = await prisma.integrationSettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      ...updateData,
    },
  })

  return NextResponse.json(buildResponse(settings))
})
