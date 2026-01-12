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
    // Handle toggle fields differently - they're booleans
    if (inputType === 'toggle') {
      const boolValue = settings?.[key] as boolean | undefined
      response[key] = boolValue ?? false
      continue
    }
    
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
  
  // Always include autoDraftEnabled (used by AI settings page)
  response.autoDraftEnabled = (settings?.autoDraftEnabled as boolean) ?? false
  
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
  const updateData: Record<string, string | boolean | null> = {}
  for (const { key, inputType } of integrations) {
    // Handle toggle fields (booleans)
    if (inputType === 'toggle') {
      if (typeof body[key] === 'boolean') {
        updateData[key] = body[key]
      }
      continue
    }
    
    // Handle string fields
    if (typeof body[key] === 'string') {
      // Empty string means clear the value
      updateData[key] = body[key] || null
    }
  }
  
  // Handle autoDraftEnabled toggle (managed from AI settings page)
  if (typeof body.autoDraftEnabled === 'boolean') {
    updateData.autoDraftEnabled = body.autoDraftEnabled
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
