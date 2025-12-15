import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AI_MODELS } from '@/lib/ai/models'
import { DEFAULT_GENERATE_TEMPLATE, DEFAULT_CHAT_TEMPLATE } from '@/lib/ai/system-prompt'

// GET /api/ai/settings - Get current AI settings
export const GET = withSession(async () => {
  // Upsert to ensure settings always exist
  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      rules: '',
      chatRules: '',
      defaultModel: 'claude-sonnet',
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    chatRules: settings.chatRules,
    defaultModel: settings.defaultModel,
    generateTemplate: settings.generateTemplate,
    chatTemplate: settings.chatTemplate,
    defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
    defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
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
  
  const updateData: { 
    rules?: string
    chatRules?: string
    defaultModel?: string
    generateTemplate?: string | null
    chatTemplate?: string | null
  } = {}

  if (typeof body.rules === 'string') {
    updateData.rules = body.rules
  }

  if (typeof body.chatRules === 'string') {
    updateData.chatRules = body.chatRules
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

  // Template fields: null means reset to default, string means custom
  if (body.generateTemplate !== undefined) {
    updateData.generateTemplate = body.generateTemplate
  }

  if (body.chatTemplate !== undefined) {
    updateData.chatTemplate = body.chatTemplate
  }

  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      rules: updateData.rules || '',
      chatRules: updateData.chatRules || '',
      defaultModel: updateData.defaultModel || 'claude-sonnet',
      generateTemplate: updateData.generateTemplate,
      chatTemplate: updateData.chatTemplate,
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    chatRules: settings.chatRules,
    defaultModel: settings.defaultModel,
    generateTemplate: settings.generateTemplate,
    chatTemplate: settings.chatTemplate,
  })
})
