import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AI_MODELS } from '@/lib/ai/models'

// GET /api/ai/settings - Get current AI settings
export const GET = withSession(async () => {
  // Upsert to ensure settings always exist
  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      rules: '',
      defaultModel: 'claude-sonnet',
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    defaultModel: settings.defaultModel,
    availableModels: AI_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
    })),
  })
})

// PATCH /api/ai/settings - Update AI settings
export const PATCH = withSession(async (request: NextRequest) => {
  const body = await request.json()
  
  const updateData: { rules?: string; defaultModel?: string } = {}

  if (typeof body.rules === 'string') {
    updateData.rules = body.rules
  }

  if (typeof body.defaultModel === 'string') {
    // Validate model exists
    const validModel = AI_MODELS.find(m => m.id === body.defaultModel)
    if (!validModel) {
      return NextResponse.json(
        { error: `Invalid model: ${body.defaultModel}` },
        { status: 400 }
      )
    }
    updateData.defaultModel = body.defaultModel
  }

  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      rules: updateData.rules || '',
      defaultModel: updateData.defaultModel || 'claude-sonnet',
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    defaultModel: settings.defaultModel,
  })
})
